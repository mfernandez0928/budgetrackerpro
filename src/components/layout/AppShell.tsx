import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { Sidebar } from "./Sidebar";
import { InstallPromptCard } from "../pwa/InstallPromptCard";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useCloudSync } from "../../hooks/useCloudSync";
import { useAuth } from "../../context/AuthContext";

export function AppShell() {
  const isOnline = useOnlineStatus();
  const { user } = useAuth();
  useCloudSync(user?.uid);

  return (
    <div className="min-h-screen bg-canvas text-ink md:flex">
      <Sidebar />

      <div className="min-w-0 flex-1">
        {!isOnline ? (
          <div className="pt-safe sticky top-0 z-30 border-b border-warn/30 bg-surface px-4 py-3 text-sm text-warn">
            You are offline. New entries save on this device and sync when you are back online.
          </div>
        ) : null}

        <main className="pt-safe pb-nav mx-auto w-full max-w-[1200px] px-4 md:px-6">
          <div className="pt-5 md:pt-7">
            <Outlet />
          </div>
        </main>
      </div>

      <InstallPromptCard />
      <BottomNavigation />
    </div>
  );
}
