import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { AppError } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth/guards";
import { UserRole } from "@/generated/prisma/client";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata("Admin");

const adminNavigation = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/personalisation", label: "Personalisation" },
  { href: "/admin/shipping", label: "Shipping" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/cms", label: "CMS" },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  try {
    await requireRole(UserRole.ADMIN);
  } catch (error) {
    if (error instanceof AppError && error.status < 500) {
      redirect("/");
    }

    throw error;
  }

  return (
    <div className="min-h-screen bg-ivory text-charcoal lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="border-b border-sand bg-white p-5 lg:min-h-screen lg:border-b-0 lg:border-r">
        <Link
          href="/admin"
          className="text-lg font-extrabold uppercase tracking-[0.14em] text-brown"
        >
          Kapriz Admin
        </Link>
        <nav aria-label="Admin navigation" className="mt-8">
          <ul className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">
            {adminNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-leather transition-colors hover:bg-sand hover:text-charcoal"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div>
        <header className="flex items-center justify-between border-b border-sand bg-white px-5 py-4 sm:px-8">
          <p className="text-sm text-leather">Administration</p>
          <ModeToggle active="admin" />
        </header>
        {children}
      </div>
    </div>
  );
}
