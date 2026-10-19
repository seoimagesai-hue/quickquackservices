import type { DefaultSession } from "next-auth";
import type { PlatformRole } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      platformRole: PlatformRole;
      emailVerified: boolean;
    };
  }

  interface User {
    platformRole?: PlatformRole;
    emailVerified?: boolean | Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    platformRole?: PlatformRole;
    emailVerified?: boolean;
  }
}

// Keep DefaultSession import referenced for tooling
type _Keep = DefaultSession;
