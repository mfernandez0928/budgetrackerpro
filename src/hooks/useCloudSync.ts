import { useEffect } from "react";
import { create } from "zustand";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useStore } from "../store/useStore";
import { decideSync, mergeSnapshots, pickSnapshot } from "../lib/sync";
import type { BudgetStoreSnapshot } from "../types/finance";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface SyncState {
  status: SyncStatus;
  lastSyncedAt: number | null;
  error: string | null;
}

export const useSyncStatus = create<SyncState>(() => ({
  status: "idle",
  lastSyncedAt: null,
  error: null,
}));

interface SyncMeta {
  syncedAt: number | null;
  localUpdatedAt: number;
}

const UPLOAD_DELAY_MS = 1500;
// Firestore documents cap at 1 MiB; leave headroom for the other fields.
const MAX_PAYLOAD_CHARS = 900_000;

function readMeta(key: string): SyncMeta {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "null") as Partial<SyncMeta> | null;
    return { syncedAt: parsed?.syncedAt ?? null, localUpdatedAt: parsed?.localUpdatedAt ?? 0 };
  } catch {
    return { syncedAt: null, localUpdatedAt: 0 };
  }
}

function writeMeta(key: string, meta: SyncMeta) {
  try {
    localStorage.setItem(key, JSON.stringify(meta));
  } catch {
    // Storage full or blocked: sync still works for this session.
  }
}

function describeError(error: unknown) {
  const code = (error as { code?: string }).code;
  if (code === "permission-denied") return "Cloud access denied. Check the Firestore security rules.";
  return error instanceof Error ? error.message : "Cloud sync failed.";
}

// Keeps the local store and users/{uid} in Firestore in step for the signed-in user.
export function useCloudSync(uid: string | undefined) {
  useEffect(() => {
    if (!uid) return;

    const ref = doc(db, "users", uid);
    const metaKey = `btp.sync.${uid}`;
    const meta = readMeta(metaKey);
    const setStatus = useSyncStatus.setState;
    let applyingRemote = false;
    // No uploads until the server copy has been read once, so an offline start never overwrites the cloud.
    let ready = false;
    let uploadTimer: ReturnType<typeof setTimeout> | undefined;

    const fail = (error: unknown) => setStatus({ status: "error", error: describeError(error) });

    const upload = async () => {
      const data = JSON.stringify(pickSnapshot(useStore.getState()));
      if (data.length > MAX_PAYLOAD_CHARS) {
        fail(new Error("Your data is too large to sync in one document."));
        return;
      }
      const updatedAt = Date.now();
      setStatus({ status: "syncing" });
      try {
        await setDoc(ref, { data, updatedAt });
        meta.syncedAt = updatedAt;
        meta.localUpdatedAt = Math.max(meta.localUpdatedAt, updatedAt);
        writeMeta(metaKey, meta);
        setStatus({ status: "synced", lastSyncedAt: updatedAt, error: null });
      } catch (error) {
        fail(error);
      }
    };

    const apply = (snapshot: BudgetStoreSnapshot, updatedAt: number) => {
      applyingRemote = true;
      useStore.getState().importSnapshot(snapshot);
      applyingRemote = false;
      meta.syncedAt = updatedAt;
      meta.localUpdatedAt = updatedAt;
      writeMeta(metaKey, meta);
      setStatus({ status: "synced", lastSyncedAt: updatedAt, error: null });
    };

    const unsubscribeStore = useStore.subscribe(() => {
      if (applyingRemote) return;
      meta.localUpdatedAt = Date.now();
      writeMeta(metaKey, meta);
      if (!ready) return;
      clearTimeout(uploadTimer);
      uploadTimer = setTimeout(() => void upload(), UPLOAD_DELAY_MS);
    });

    setStatus({ status: "syncing", error: null });
    const unsubscribeCloud = onSnapshot(
      ref,
      (snap) => {
        // Our own write echoing back before the server confirms it.
        if (snap.metadata.hasPendingWrites) return;
        // A cache-only read may say "no document" while the server has one.
        if (snap.metadata.fromCache) return;
        ready = true;
        const cloud = snap.exists() ? (snap.data() as { data: string; updatedAt: number }) : null;
        const action = decideSync({
          cloudUpdatedAt: cloud?.updatedAt ?? null,
          syncedAt: meta.syncedAt,
          localUpdatedAt: meta.localUpdatedAt,
        });

        try {
          if (action === "upload") {
            void upload();
          } else if (cloud && action === "download") {
            apply(JSON.parse(cloud.data) as BudgetStoreSnapshot, cloud.updatedAt);
          } else if (cloud && action === "merge") {
            const local = pickSnapshot(useStore.getState());
            apply(mergeSnapshots(local, JSON.parse(cloud.data) as BudgetStoreSnapshot), cloud.updatedAt);
            void upload();
          } else {
            setStatus({ status: "synced", lastSyncedAt: meta.syncedAt, error: null });
          }
        } catch (error) {
          fail(error);
        }
      },
      fail,
    );

    return () => {
      clearTimeout(uploadTimer);
      unsubscribeStore();
      unsubscribeCloud();
      setStatus({ status: "idle", error: null });
    };
  }, [uid]);
}
