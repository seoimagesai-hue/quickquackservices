import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible Auth.js config for middleware.
 * Do not import Node-only modules (bcrypt, mongoose) here.
 */
export const edgeAuthConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.platformRole =
          (user as { platformRole?: string }).platformRole || "user";
        token.emailVerified = Boolean(
          (user as { emailVerified?: boolean | Date | null }).emailVerified
        );
      }
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        if (typeof session.emailVerified === "boolean") {
          token.emailVerified = session.emailVerified;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as {
          id: string;
          platformRole: "platform_admin" | "user";
          emailVerified: boolean;
        };
        u.id = (token.id as string) || "";
        u.platformRole =
          (token.platformRole as "platform_admin" | "user") || "user";
        u.emailVerified = Boolean(token.emailVerified);
      }
      return session;
    },
  },
  trustHost: true,
};
