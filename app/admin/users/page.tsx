import Link from "next/link";
import { listAdminUsers } from "@/lib/server/admin-users";

type PageProps = {
  searchParams: Promise<{ search?: string }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { search = "" } = await searchParams;
  const users = await listAdminUsers(search);

  return (
    <main className="p-5 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
          <p className="mt-2 text-leather">Customer and staff accounts (read-only).</p>
        </div>
        <form className="flex gap-2" action="/admin/users">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search name or email"
            className="border border-sand bg-white px-3 py-2 text-sm"
          />
          <button className="rounded bg-brown px-4 py-2 text-sm font-semibold text-white">Search</button>
        </form>
      </div>

      <div className="mt-8 overflow-x-auto border border-sand bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-sand bg-ivory text-leather">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Orders</th>
              <th className="px-4 py-3 font-semibold">Addresses</th>
              <th className="px-4 py-3 font-semibold">Personalisation</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-sand last:border-0">
                <td className="px-4 py-3 font-semibold">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">{user.createdAt.toLocaleDateString()}</td>
                <td className="px-4 py-3">{user._count.orders}</td>
                <td className="px-4 py-3">{user._count.addresses}</td>
                <td className="px-4 py-3">{user._count.personalisationRequests}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/users/${user.id}`} className="font-semibold text-leather hover:text-brown">View</Link>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-leather">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
