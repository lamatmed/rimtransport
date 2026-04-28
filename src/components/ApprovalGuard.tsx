"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/authService";

export function ApprovalGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApproval = async () => {
      // Pages that don't need approval check
      const publicPages = ["/login", "/signup", "/pending-approval", "/help"];
      if (publicPages.includes(pathname)) {
        setLoading(false);
        return;
      }

      try {
        const user = await authService.getCurrentUser();
        if (user?.email === "admin@gmail.mr") {
          setLoading(false);
          return;
        }
        if (user && user.role === "driver" && !user.isApproved) {
          router.replace("/pending-approval");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Approval check failed:", error);
        setLoading(false);
      }
    };

    checkApproval();
  }, [pathname, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid rgba(0, 169, 92, 0.1)", borderTopColor: "var(--primary-green)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
