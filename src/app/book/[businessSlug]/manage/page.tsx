import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ManageBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessSlug: string }>;
  searchParams: Promise<{ token?: string; appointmentId?: string }>;
}) {
  const { businessSlug } = await params;
  const { token, appointmentId } = await searchParams;

  if (token && appointmentId) {
    redirect(
      `/book/${businessSlug}/manage/${appointmentId}?token=${encodeURIComponent(token)}`
    );
  }

  if (token && !appointmentId) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Manage your booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Open the link from your confirmation email. It includes a secure token
            and appointment ID.
          </p>
          <p>
            Example:{" "}
            <code className="rounded bg-muted px-1 text-xs">
              /book/{businessSlug}/manage/&lt;appointmentId&gt;?token=…
            </code>
          </p>
          <Link href={`/book/${businessSlug}`} className="text-primary hover:underline">
            Book a new appointment
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
