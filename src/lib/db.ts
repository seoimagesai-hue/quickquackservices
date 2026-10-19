import mongoose from "mongoose";
import { env } from "@/lib/env";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

function formatDbError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: unknown }).code)
      : "";

  if (code === "ENODATA" || message.includes("querySrv ENODATA")) {
    return new Error(
      "MongoDB Atlas hostname could not be resolved (DNS SRV ENODATA). Copy the full connection string from Atlas → Connect → Drivers. The host must look like cluster0.xxxxx.mongodb.net, not a custom name you invented."
    );
  }
  if (code === "ENOTFOUND" || message.includes("querySrv ENOTFOUND")) {
    return new Error(
      "MongoDB host not found. Check MONGODB_URI cluster hostname in Atlas."
    );
  }
  if (message.includes("bad auth") || message.includes("Authentication failed")) {
    return new Error(
      "MongoDB authentication failed. Check the database user and password in MONGODB_URI (URL-encode special characters)."
    );
  }
  if (message.includes("whitelist") || message.includes("IP that isn't")) {
    return new Error(
      "MongoDB refused the connection. In Atlas → Network Access, allow your current IP (or 0.0.0.0/0 for local dev)."
    );
  }
  return err instanceof Error ? err : new Error(message);
}

export async function connectDB(): Promise<typeof mongoose> {
  if (!env.mongodbUri) {
    // During `next build` without env, callers should use force-dynamic pages.
    throw new Error(
      "MONGODB_URI is not configured. Add it to your environment to enable the database."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(env.mongodbUri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      })
      .catch((err) => {
        cached.promise = null;
        throw formatDbError(err);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.conn = null;
    throw formatDbError(err);
  }
  return cached.conn;
}

export function isDbReady(): boolean {
  return Boolean(env.mongodbUri);
}
