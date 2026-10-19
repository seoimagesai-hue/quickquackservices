import { test, expect } from "@playwright/test";

/**
 * Concurrent hold attempts against the same slot.
 * Requires MONGODB_URI and seeded demo business (/book/demo-studio).
 * Skips gracefully when API is unavailable.
 */
test.describe("booking concurrency", () => {
  test("only one active hold wins for the same slot", async ({
    request,
  }) => {
    const slug = "demo-studio";
    const meta = await request.get(`/api/book/${slug}`);
    if (!meta.ok()) {
      test.skip(true, "Demo business API not available — run seed + MongoDB");
      return;
    }

    const body = await meta.json();
    const serviceId = body.services?.[0]?.id || body.services?.[0]?._id;
    const staffId =
      body.staff?.[0]?.id ||
      body.staff?.[0]?._id ||
      body.services?.[0]?.staffId;
    if (!serviceId) {
      test.skip(true, "No services on demo business");
      return;
    }

    // Find a date with slots (next 14 weekdays)
    let startAt: string | null = null;
    let chosenStaff = staffId;
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const ymd = d.toISOString().slice(0, 10);
      const slotsRes = await request.get(
        `/api/book/${slug}/slots?serviceId=${serviceId}&staffId=any&date=${ymd}`
      );
      if (!slotsRes.ok()) continue;
      const slotsBody = await slotsRes.json();
      const first = slotsBody.results?.find(
        (r: { slots: unknown[] }) => r.slots?.length
      );
      if (first?.slots?.[0]) {
        startAt = first.slots[0].startAt;
        chosenStaff = first.staffMemberId;
        break;
      }
    }

    if (!startAt || !chosenStaff) {
      test.skip(true, "No available slots found in window");
      return;
    }

    const payload = {
      serviceId,
      staffMemberId: chosenStaff,
      startAt,
    };

    const [a, b] = await Promise.all([
      request.post(`/api/book/${slug}/hold`, { data: payload }),
      request.post(`/api/book/${slug}/hold`, { data: payload }),
    ]);

    const statuses = [a.status(), b.status()].sort();
    // One success (200/201), one conflict (409) — or second fails with error body
    const bodies = await Promise.all([a.json(), b.json()]);
    const successes = bodies.filter((x) => x.ok || x.holdToken);
    const failures = bodies.filter((x) => !x.ok && !x.holdToken);
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);
    expect(statuses[0]).toBeLessThan(500);
  });
});
