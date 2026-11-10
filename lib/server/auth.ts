import "server-only";

import { conflict, unauthorized } from "@/lib/api/errors";
import type { AuthUser } from "@/lib/auth/guards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function toPublicUser(user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AuthUser["role"];
}): AuthUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}

export async function registerUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      passwordHash,
      cart: { create: {} },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });

  const token = await createSessionToken({
    userId: user.id,
    role: user.role,
  });
  await setSessionCookie(token);

  return toPublicUser(user);
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw unauthorized("Invalid email or password");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw unauthorized("Invalid email or password");
  }

  const token = await createSessionToken({
    userId: user.id,
    role: user.role,
  });
  await setSessionCookie(token);

  return toPublicUser(user);
}

export async function logoutUser() {
  await clearSessionCookie();
}
