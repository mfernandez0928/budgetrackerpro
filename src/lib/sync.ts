import type { BudgetStoreSnapshot } from "../types/finance";

const COLLECTION_KEYS = [
  "transactions",
  "categories",
  "accounts",
  "budgets",
  "savingsGoals",
  "recurringBills",
  "debts",
  "moneyOwed",
  "plannedPayments",
  "installments",
] as const;

export type SyncAction = "upload" | "download" | "merge" | "none";

export interface SyncClock {
  // updatedAt stored with the cloud copy; null when the user has no cloud copy yet.
  cloudUpdatedAt: number | null;
  // cloud updatedAt this device last uploaded or applied; null when this device never synced.
  syncedAt: number | null;
  // last time this device's data changed.
  localUpdatedAt: number;
}

export function decideSync({ cloudUpdatedAt, syncedAt, localUpdatedAt }: SyncClock): SyncAction {
  if (cloudUpdatedAt === null) return "upload";
  if (syncedAt === null) return "merge";

  const cloudChanged = cloudUpdatedAt > syncedAt;
  const localChanged = localUpdatedAt > syncedAt;
  if (!cloudChanged && !localChanged) return "none";
  if (cloudChanged && !localChanged) return "download";
  if (!cloudChanged && localChanged) return "upload";
  return localUpdatedAt > cloudUpdatedAt ? "upload" : "download";
}

function unionById<T extends { id: string }>(local: T[], cloud: T[]): T[] {
  const cloudIds = new Set(cloud.map((item) => item.id));
  return [...cloud, ...local.filter((item) => !cloudIds.has(item.id))];
}

// First sync on a device: keep every record from both sides so nothing is lost.
export function mergeSnapshots(local: BudgetStoreSnapshot, cloud: BudgetStoreSnapshot): BudgetStoreSnapshot {
  const merged = { ...cloud };
  for (const key of COLLECTION_KEYS) {
    (merged[key] as { id: string }[]) = unionById(
      local[key] as { id: string }[],
      cloud[key] as { id: string }[],
    );
  }
  merged.profile = {
    ...cloud.profile,
    hasCompletedOnboarding: local.profile.hasCompletedOnboarding || cloud.profile.hasCompletedOnboarding,
  };
  return merged;
}

export function pickSnapshot(state: BudgetStoreSnapshot): BudgetStoreSnapshot {
  const snapshot = {} as Record<string, unknown>;
  for (const key of COLLECTION_KEYS) snapshot[key] = state[key];
  snapshot.settings = state.settings;
  snapshot.profile = state.profile;
  return snapshot as unknown as BudgetStoreSnapshot;
}
