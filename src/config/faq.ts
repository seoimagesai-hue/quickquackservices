export type FaqItem = { id: string; question: string; answer: string };

export const faqItems: FaqItem[] = [
  {
    id: "trial",
    question: "How does the free trial work?",
    answer:
      "Each plan includes a 14-day trial with full access to plan limits. No credit card is required to start unless you enable live Stripe billing in your deployment.",
  },
  {
    id: "cancel",
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel from your billing settings. Access continues until the end of the current billing period. See the Refund Policy for illustrative terms before going live.",
  },
  {
    id: "staff",
    question: "Can multiple staff members share one calendar?",
    answer:
      "Professional and Business plans support multiple bookable staff with individual availability, services, and role-based permissions.",
  },
  {
    id: "sms",
    question: "Do you send SMS reminders?",
    answer:
      "SMS reminders are available on the Business plan but require you to configure an SMS provider (for example Twilio). Email reminders work out of the box when email is configured.",
  },
  {
    id: "embed",
    question: "Can I embed booking on my website?",
    answer:
      "Each business gets a branded booking page you can link from your site. Custom domain and embed options depend on your deployment configuration.",
  },
  {
    id: "data",
    question: "Where is my data stored?",
    answer:
      "Quick Quack Services stores business and appointment data in your configured database (MongoDB). You control backups, retention, and data processing agreements for production.",
  },
  {
    id: "timezone",
    question: "How do time zones work?",
    answer:
      "Businesses set a default timezone. Customers see slots in their local context when supported by your booking page settings.",
  },
  {
    id: "support",
    question: "How do I get support?",
    answer:
      "Use the contact form or email support@quickquackservices.store / contact@quickquackservices.store. Delivery works only after your email provider and DNS are configured.",
  },
];
