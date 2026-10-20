export type FaqItem = { id: string; question: string; answer: string };

export const faqItems: FaqItem[] = [
  {
    id: "trial",
    question: "How does the free trial work?",
    answer:
      "Each plan includes a 14-day free trial with full access to that plan’s features and limits. You can upgrade, downgrade, or cancel before the trial ends.",
  },
  {
    id: "cancel",
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel from your billing settings. Access continues until the end of the current billing period. See the Refund Policy for full details.",
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
      "Email reminders are included. SMS reminders are available on the Business plan so you can reduce no-shows with text notifications.",
  },
  {
    id: "embed",
    question: "Can I embed booking on my website?",
    answer:
      "Each business gets a branded booking page you can share as a link or add to your website, social profiles, and email signature.",
  },
  {
    id: "data",
    question: "Where is my data stored?",
    answer:
      "Quick Quack Services stores your business, customer, and appointment data securely in your workspace database with tenant isolation between businesses.",
  },
  {
    id: "timezone",
    question: "How do time zones work?",
    answer:
      "Each business sets a default timezone. Availability and bookings stay consistent so you and your customers see the right times.",
  },
  {
    id: "support",
    question: "How do I get support?",
    answer:
      "Use the contact form or email support@quickquackservices.store / contact@quickquackservices.store and our team will help you get set up.",
  },
];
