import Link from "next/link";

type ModeToggleProps = {
  active: "admin" | "storefront";
};

export function ModeToggle({ active }: ModeToggleProps) {
  const isAdmin = active === "admin";

  return (
    <Link
      href={isAdmin ? "/" : "/admin"}
      aria-label={isAdmin ? "Switch to storefront mode" : "Switch to admin mode"}
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        isAdmin
          ? "border-brown bg-brown text-white"
          : "border-sand text-brown hover:border-brown"
      }`}
    >
      {isAdmin ? "Admin mode: on" : "Admin mode"}
    </Link>
  );
}
