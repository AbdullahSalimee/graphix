"use client";

/**
 * RouteGuard
 *
 * Wrap any page component with this to require authentication.
 * If user is not logged in (no token in Zustand), redirect to /signin.
 *
 * Usage in page.tsx:
 *   export default function DashboardPage() {
 *     return <RouteGuard><DashboardContent /></RouteGuard>;
 *   }
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";

interface Props {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function RouteGuard({ children, redirectTo = "/signin" }: Props) {
  const router = useRouter();
  const { isAuthenticated, isBootstrapped, isBootstrapping } = useAppStore();

  useEffect(() => {
    // If definitely not authenticated, redirect immediately
    if (!isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  // Not authenticated — show nothing while redirect happens
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated but still loading bootstrap — AppBootstrapper already shows spinner
  // so we return null here to avoid double-rendering
  if (!isBootstrapped && isBootstrapping) {
    return null;
  }

  return <>{children}</>;
}
