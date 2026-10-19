import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { verifyPassword } from "@/lib/security/password";
import { rateLimit } from "@/lib/security/rate-limit";
import { edgeAuthConfig } from "@/lib/auth/edge-config";
import type { NextAuthConfig } from "next-auth";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const authConfig: NextAuthConfig = {
  ...edgeAuthConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const ip =
          request?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ||
          "unknown";
        const limited = rateLimit(
          `login:${ip}:${parsed.data.email}`,
          10,
          15 * 60 * 1000
        );
        if (!limited.success) {
          throw new Error("Too many login attempts. Try again later.");
        }

        await connectDB();
        const user = await User.findOne({
          email: parsed.data.email.toLowerCase(),
        }).select("+passwordHash");

        if (!user || !user.passwordHash || user.status !== "active") {
          return null;
        }

        const valid = await verifyPassword(
          parsed.data.password,
          user.passwordHash
        );
        if (!valid) return null;

        user.lastLoginAt = new Date();
        await user.save();

        return {
          id: String(user._id),
          email: user.email,
          name: user.name,
          image: user.image,
          platformRole: user.platformRole,
          emailVerified: Boolean(user.emailVerified),
        };
      },
    }),
  ],
};
