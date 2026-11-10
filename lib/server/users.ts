import "server-only";

import { notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) throw notFound("User not found");
  return user;
}

export async function updateUserProfile(
  userId: string,
  input: { firstName?: string; lastName?: string },
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.firstName !== undefined
        ? { firstName: input.firstName.trim() }
        : {}),
      ...(input.lastName !== undefined
        ? { lastName: input.lastName.trim() }
        : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });
}

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAddress(
  userId: string,
  input: {
    firstName: string;
    lastName: string;
    country: string;
    city: string;
    addressLine1: string;
    addressLine2?: string | null;
    postalCode: string;
    phone: string;
    isDefault?: boolean;
  },
) {
  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId,
        firstName: input.firstName,
        lastName: input.lastName,
        country: input.country.toUpperCase(),
        city: input.city,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 ?? null,
        postalCode: input.postalCode,
        phone: input.phone,
        isDefault: Boolean(input.isDefault),
      },
    });
  });
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: {
    firstName: string;
    lastName: string;
    country: string;
    city: string;
    addressLine1: string;
    addressLine2?: string | null;
    postalCode: string;
    phone: string;
    isDefault?: boolean;
  },
) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) throw notFound("Address not found");

  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { id: addressId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        country: input.country.toUpperCase(),
        city: input.city,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 ?? null,
        postalCode: input.postalCode,
        phone: input.phone,
        isDefault: Boolean(input.isDefault),
      },
    });
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  const result = await prisma.address.deleteMany({
    where: { id: addressId, userId },
  });
  if (result.count === 0) throw notFound("Address not found");
  return { success: true };
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      addresses: true,
      cart: { include: { items: true } },
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
    },
  });
}
