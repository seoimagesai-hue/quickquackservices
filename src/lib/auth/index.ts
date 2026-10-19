import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import type { SessionUser } from "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name || "",
    image: session.user.image,
    platformRole: session.user.platformRole || "user",
    emailVerified: Boolean(session.user.emailVerified),
  };
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
