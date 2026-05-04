"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function StatusTracker() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const updateStatus = async (isOnline: boolean) => {
      try {
        await fetch("/api/user/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isOnline }),
        });
      } catch (e) {}
    };

    updateStatus(true);

    const handleVisibilityChange = () => {
      updateStatus(document.visibilityState === "visible");
    };

    window.addEventListener("beforeunload", () => updateStatus(false));
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      updateStatus(false);
      window.removeEventListener("beforeunload", () => updateStatus(false));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session?.user?.id]);

  return null;
}
