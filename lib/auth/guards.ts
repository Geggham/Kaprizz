import type { UserRole } from "@/generated/prisma/client";
import { forbidden, unauthorized } from "@/lib/api/errors";
import { readSessionFromCookies, type SessionPayload } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};

export async function getSession(): Promise<SessionPayload | null> {
  return readSessionFromCookies();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });

  return user;
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw unauthorized();
  }
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<AuthUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw forbidden();
  }
  return user;
}
