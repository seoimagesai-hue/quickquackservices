import { AlertTriangle } from "lucide-react";

export function LegalDraftNotice() {
  return (
    <div className="mb-8 flex gap-3 border border-secondary/40 bg-secondary/10 p-4 text-sm text-white/80">
      <AlertTriangle
        className="size-5 shrink-0 text-secondary"
        aria-hidden
        strokeWidth={1.5}
      />
      <p>
        <strong className="text-white">Draft — requires legal review before publication.</strong>{" "}
        Company identity details are taken from Companies House where verified.
        Do not treat this page as final legal advice. Confirm refund, privacy and
        consumer terms with qualified UK counsel before relying on them.
      </p>
    </div>
  );
}
