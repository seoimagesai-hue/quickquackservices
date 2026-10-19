import { BookingWizard } from "@/components/booking/booking-wizard";

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;
  return (
    <div className="container-page py-12">
      <BookingWizard slug={businessSlug} />
    </div>
  );
}
