"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCommerce } from "@/context/commerce-context";

type Address = {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string;
  phone: string;
  isDefault: boolean;
};

type OrderSummary = {
  id: string;
  status: string;
  total: string | number;
  createdAt: string;
};

export function AccountContent() {
  const { signOut, user, refreshSession } = useCommerce();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [message, setMessage] = useState("");
  const [addressForm, setAddressForm] = useState({
    firstName: "",
    lastName: "",
    country: "AM",
    city: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    phone: "",
    isDefault: true,
  });

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [addressResponse, orderResponse] = await Promise.all([
        fetch("/api/account/addresses"),
        fetch("/api/orders"),
      ]);
      const addressPayload = await addressResponse.json();
      const orderPayload = await orderResponse.json();
      setAddresses(addressPayload.data?.addresses ?? []);
      setOrders(orderPayload.data?.orders ?? []);
    })();
  }, [user]);

  if (!user) {
    return (
      <section className="bg-white p-8">
        <p className="text-leather">
          Please sign in from the account icon to view your account.
        </p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("kapriz:open-auth"))}
          className="mt-5 border-b border-brown pb-1 text-sm font-semibold text-brown"
        >
          Sign In
        </button>
      </section>
    );
  }

  const saveAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...addressForm,
        addressLine2: addressForm.addressLine2 || null,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error?.message ?? "Could not save address");
      return;
    }
    setAddresses((current) => [payload.data.address, ...current]);
    setMessage("Address saved.");
    await refreshSession();
  };

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <section className="border-t border-sand pt-6">
        <h2 className="text-xl font-semibold text-charcoal">Account Details</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="text-leather">Name</dt>
            <dd className="mt-1 text-charcoal">
              {user.firstName} {user.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-leather">Email</dt>
            <dd className="mt-1 text-charcoal">{user.email}</dd>
          </div>
          <div>
            <dt className="text-leather">Role</dt>
            <dd className="mt-1 text-charcoal">{user.role}</dd>
          </div>
        </dl>
        {user.role === "ADMIN" ? (
          <Link
            href="/admin"
            className="mt-5 inline-block border-b border-brown pb-1 text-sm font-semibold text-brown"
          >
            Admin
          </Link>
        ) : null}
      </section>

      <section className="border-t border-sand pt-6">
        <h2 className="text-xl font-semibold text-charcoal">Orders</h2>
        {orders.length ? (
          <ul className="mt-5 space-y-3 text-sm">
            {orders.map((order) => (
              <li key={order.id} className="flex justify-between gap-4 text-charcoal">
                <span>
                  {new Date(order.createdAt).toLocaleDateString()} · {order.status}
                </span>
                <span>${Number(order.total).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm text-leather">No orders yet.</p>
        )}
        <Link
          href="/account/orders"
          className="mt-5 inline-block border-b border-brown pb-1 text-sm font-semibold text-brown"
        >
          View all orders
        </Link>
      </section>

      <section className="border-t border-sand pt-6 md:col-span-2">
        <h2 className="text-xl font-semibold text-charcoal">Saved Addresses</h2>
        {addresses.length ? (
          <ul className="mt-5 space-y-4 text-sm text-charcoal">
            {addresses.map((address) => (
              <li key={address.id} className="border border-sand p-4">
                <p className="font-semibold">
                  {address.firstName} {address.lastName}
                  {address.isDefault ? " · Default" : ""}
                </p>
                <p className="mt-2 text-leather">
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                </p>
                <p className="text-leather">
                  {address.city}, {address.postalCode}, {address.country}
                </p>
                <p className="text-leather">{address.phone}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm text-leather">No saved addresses yet.</p>
        )}

        <form onSubmit={saveAddress} className="mt-8 grid gap-3 sm:grid-cols-2">
          <input
            className="border border-sand px-3 py-3 text-sm"
            placeholder="First name"
            value={addressForm.firstName}
            onChange={(event) =>
              setAddressForm((current) => ({
                ...current,
                firstName: event.target.value,
              }))
            }
            required
          />
          <input
            className="border border-sand px-3 py-3 text-sm"
            placeholder="Last name"
            value={addressForm.lastName}
            onChange={(event) =>
              setAddressForm((current) => ({
                ...current,
                lastName: event.target.value,
              }))
            }
            required
          />
          <input
            className="border border-sand px-3 py-3 text-sm"
            placeholder="Country code (AM)"
            value={addressForm.country}
            onChange={(event) =>
              setAddressForm((current) => ({
                ...current,
                country: event.target.value.toUpperCase(),
              }))
            }
            required
            maxLength={2}
          />
          <input
            className="border border-sand px-3 py-3 text-sm"
            placeholder="City"
            value={addressForm.city}
            onChange={(event) =>
              setAddressForm((current) => ({
                ...current,
                city: event.target.value,
              }))
            }
            required
          />
          <input
            className="border border-sand px-3 py-3 text-sm sm:col-span-2"
            placeholder="Address line 1"
            value={addressForm.addressLine1}
            onChange={(event) =>
              setAddressForm((current) => ({
                ...current,
                addressLine1: event.target.value,
              }))
            }
            required
          />
          <input
            className="border border-sand px-3 py-3 text-sm sm:col-span-2"
            placeholder="Address line 2 (optional)"
            value={addressForm.addressLine2}
            onChange={(event) =>
              setAddressForm((current) => ({
                ...current,
                addressLine2: event.target.value,
              }))
            }
          />
          <input
            className="border border-sand px-3 py-3 text-sm"
            placeholder="Postal code"
            value={addressForm.postalCode}
            onChange={(event) =>
              setAddressForm((current) => ({
                ...current,
                postalCode: event.target.value,
              }))
            }
            required
          />
          <input
            className="border border-sand px-3 py-3 text-sm"
            placeholder="Phone"
            value={addressForm.phone}
            onChange={(event) =>
              setAddressForm((current) => ({
                ...current,
                phone: event.target.value,
              }))
            }
            required
          />
          <button
            type="submit"
            className="bg-brown px-4 py-3 text-sm font-semibold text-white sm:col-span-2"
          >
            Save Address
          </button>
          {message ? <p className="text-sm text-leather sm:col-span-2">{message}</p> : null}
        </form>
      </section>

      <section className="border-t border-sand pt-6">
        <h2 className="text-xl font-semibold text-charcoal">Favorites</h2>
        <Link
          href="/favorites"
          className="mt-5 inline-block border-b border-brown pb-1 text-sm font-semibold text-brown"
        >
          View Favorites
        </Link>
      </section>

      <button
        type="button"
        onClick={() => void signOut()}
        className="justify-self-start border-b border-brown pb-1 text-sm font-semibold text-brown"
      >
        Sign Out
      </button>
    </div>
  );
}
