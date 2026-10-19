/**
 * Demo seed — clearly labelled demo data for local development.
 * Usage: npx tsx --env-file=.env.local scripts/seed.ts
 *
 * Does NOT create a production admin unless SEED_ADMIN_PASSWORD is set.
 */
import mongoose from "mongoose";
import { addDays, addMinutes, setHours, setMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import bcrypt from "bcryptjs";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  await mongoose.connect(uri);

  // Dynamic imports after connect so models register once
  const { User } = await import("../src/models/User");
  const { Business } = await import("../src/models/Business");
  const { BusinessMember } = await import("../src/models/BusinessMember");
  const { Service } = await import("../src/models/Service");
  const { StaffAvailability } = await import("../src/models/StaffAvailability");
  const { Customer } = await import("../src/models/Customer");
  const { Appointment } = await import("../src/models/Appointment");
  const { Subscription } = await import("../src/models/Subscription");

  const demoPassword =
    process.env.SEED_DEMO_PASSWORD || "DemoPass123!";
  const demoHash = await bcrypt.hash(demoPassword, 12);

  let owner = await User.findOne({ email: "demo.owner@appointly.local" });
  if (!owner) {
    owner = await User.create({
      name: "Demo Owner",
      email: "demo.owner@appointly.local",
      passwordHash: demoHash,
      emailVerified: new Date(),
      platformRole: "user",
      timezone: "America/New_York",
    });
    console.log("Created DEMO owner: demo.owner@appointly.local");
  }

  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    const adminEmail = process.env.SEED_ADMIN_EMAIL.toLowerCase();
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: "Platform Admin",
        email: adminEmail,
        passwordHash: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 12),
        emailVerified: new Date(),
        platformRole: "platform_admin",
      });
      console.log(`Created platform admin: ${adminEmail}`);
    } else if (admin.platformRole !== "platform_admin") {
      admin.platformRole = "platform_admin";
      await admin.save();
      console.log(`Promoted existing user to platform admin: ${adminEmail}`);
    }
  } else {
    console.log(
      "Skipped platform admin seed (set SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD to create one)."
    );
  }

  let business = await Business.findOne({ slug: "demo-studio" });
  if (!business) {
    business = await Business.create({
      name: "Demo Wellness Studio",
      slug: "demo-studio",
      ownerId: owner._id,
      description:
        "[DEMO DATA] Sample wellness studio for exploring Appointly booking.",
      industry: "salon",
      category: "salon",
      serviceMode: "in_location",
      requireStaffSelection: true,
      requireServiceAddress: false,
      timezone: "America/New_York",
      email: "demo.owner@appointly.local",
      phone: "[DEMO] +1-555-0100",
      onboardingCompleted: true,
      intakeFields: [
        {
          key: "notes",
          label: "Notes for your stylist",
          type: "textarea",
          required: false,
        },
      ],
      businessHours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
        day,
        enabled: day >= 1 && day <= 5,
        ranges: day >= 1 && day <= 5 ? [{ start: "09:00", end: "17:00" }] : [],
      })),
    });
    console.log("Created DEMO business slug: demo-studio");
  }

  let member = await BusinessMember.findOne({
    businessId: business._id,
    userId: owner._id,
  });
  if (!member) {
    member = await BusinessMember.create({
      businessId: business._id,
      userId: owner._id,
      role: "owner",
      title: "Lead Practitioner",
      isBookable: true,
      status: "active",
      permissions: {
        manageBookings: true,
        manageServices: true,
        manageStaff: true,
        manageCustomers: true,
        manageSettings: true,
        viewAnalytics: true,
      },
    });
  }

  await StaffAvailability.findOneAndUpdate(
    { businessId: business._id, memberId: member._id },
    {
      weeklyHours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
        day,
        enabled: day >= 1 && day <= 5,
        ranges: day >= 1 && day <= 5 ? [{ start: "09:00", end: "17:00" }] : [],
      })),
      breaks: [{ day: 1, start: "12:00", end: "13:00", label: "Lunch" }],
    },
    { upsert: true }
  );

  const serviceDefs = [
    {
      name: "Consultation",
      durationMinutes: 30,
      priceCents: 5000,
      description: "[DEMO] Introductory consultation",
    },
    {
      name: "Standard Session",
      durationMinutes: 60,
      priceCents: 9000,
      description: "[DEMO] Full session",
    },
  ];

  for (const def of serviceDefs) {
    await Service.findOneAndUpdate(
      { businessId: business._id, name: def.name },
      { ...def, isActive: true, currency: "USD" },
      { upsert: true }
    );
  }

  await Subscription.findOneAndUpdate(
    { businessId: business._id },
    {
      planId: "professional",
      status: "trialing",
      billingInterval: "month",
      trialEndsAt: addDays(new Date(), 14),
    },
    { upsert: true }
  );

  let customer = await Customer.findOne({
    businessId: business._id,
    email: "demo.customer@appointly.local",
  });
  if (!customer) {
    customer = await Customer.create({
      businessId: business._id,
      name: "Demo Customer",
      email: "demo.customer@appointly.local",
      phone: "[DEMO] +1-555-0199",
      notes: "[DEMO DATA]",
    });
  }

  const service = await Service.findOne({
    businessId: business._id,
    name: "Consultation",
  });

  if (service) {
    const tz = business.timezone;
    const tomorrow = addDays(new Date(), 1);
    const localStart = setMinutes(setHours(tomorrow, 10), 0);
    const startAt = fromZonedTime(localStart, tz);
    const existing = await Appointment.findOne({
      businessId: business._id,
      customerId: customer._id,
      serviceId: service._id,
      startAt,
    });
    if (!existing) {
      await Appointment.create({
        businessId: business._id,
        serviceId: service._id,
        staffMemberId: member._id,
        customerId: customer._id,
        startAt,
        endAt: addMinutes(startAt, service.durationMinutes),
        timezone: tz,
        status: "confirmed",
        priceCents: service.priceCents,
        currency: "USD",
        source: "dashboard",
        notes: "[DEMO DATA]",
      });
    }
  }

  console.log("\n=== DEMO CREDENTIALS (local only) ===");
  console.log("Owner email:    demo.owner@appointly.local");
  console.log(`Owner password: ${demoPassword}`);
  console.log("Public booking: /book/demo-studio");
  console.log("====================================\n");

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
