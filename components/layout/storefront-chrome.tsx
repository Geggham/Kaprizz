"use client";

import { usePathname } from "next/navigation";

type StorefrontChromeProps = {
  announcement: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
};

export function StorefrontChrome({
  announcement,
  header,
  footer,
  children,
}: StorefrontChromeProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <>
      {isAdminRoute ? null : announcement}
      {isAdminRoute ? null : header}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {isAdminRoute ? null : footer}
    </>
  );
}
