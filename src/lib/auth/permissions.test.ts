import { describe, expect, it } from "vitest";
import { AuthError } from "./permissions";

describe("AuthError", () => {
  it("carries HTTP status", () => {
    const err = new AuthError("nope", 403);
    expect(err.status).toBe(403);
    expect(err.message).toBe("nope");
  });
});
