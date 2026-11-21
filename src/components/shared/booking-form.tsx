"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays, Loader2, MapPin, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBooking, type BookingRecord } from "@/lib/api/booking-api";
import { authClient } from "@/lib/auth-client";
import type { ServiceRecord } from "@/lib/api/service-api";

type FormErrors = Partial<Record<"eventDate" | "eventLocation" | "message", string>>;

export default function BookingForm({ service }: { service: ServiceRecord }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<BookingRecord | null>(null);

  const setValue = (key: keyof FormErrors, value: string) => {
    if (key === "eventDate") setEventDate(value);
    if (key === "eventLocation") setEventLocation(value);
    if (key === "message") setMessage(value);
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!eventDate) nextErrors.eventDate = "Choose your event date.";
    else if (Number.isNaN(new Date(eventDate).getTime()))
      nextErrors.eventDate = "Choose a valid date.";
    if (!eventLocation.trim()) nextErrors.eventLocation = "Event location is required.";
    if (!message.trim()) nextErrors.message = "Please write a short message.";
    else if (message.trim().length > 1000)
      nextErrors.message = "Message must be 1000 characters or fewer.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please check the highlighted fields.");
      return;
    }

    setSubmitting(true);

    try {
      const booking = await createBooking({
        serviceId: service.id,
        eventDate: new Date(eventDate).toISOString(),
        eventLocation: eventLocation.trim(),
        message: message.trim(),
      });

      setCreated(booking);
      toast.success("Request sent!", {
        description: "The vendor will review your booking request shortly.",
      });
      setEventDate("");
      setEventLocation("");
      setMessage("");
    } catch (err) {
      toast.error("Could not send your request", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending) {
    return <div className="theme-card h-64 animate-pulse" />;
  }

  if (!session) {
    return (
      <div className="theme-card p-6">
        <h2 className="font-heading text-lg font-semibold text-(--text-primary)">
          Sign in to book
        </h2>
        <p className="muted-text mt-2 text-sm">
          You need a customer account to send a booking request.
        </p>
        <Button
          type="button"
          onClick={() =>
            router.push(
              `/sign-in?callbackUrl=${encodeURIComponent(`/services/${service.id}`)}`
            )
          }
          className="mt-4 rounded-full"
        >
          Sign in to continue
        </Button>
      </div>
    );
  }

  const role = (session.user as { role?: string }).role;

  if (session.user.id === service.vendorId) {
    return (
      <div className="theme-card p-6">
        <h2 className="font-heading text-lg font-semibold text-(--text-primary)">
          This is your service
        </h2>
        <p className="muted-text mt-2 text-sm">
          Vendors can&apos;t submit booking requests for their own listings.
        </p>
      </div>
    );
  }

  if (role !== "customer") {
    return (
      <div className="theme-card p-6">
        <h2 className="font-heading text-lg font-semibold text-(--text-primary)">
          Customers only
        </h2>
        <p className="muted-text mt-2 text-sm">
          Booking requests can only be sent by customer accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="theme-card p-5 sm:p-6">
      <h2 className="font-heading text-lg font-semibold text-(--text-primary)">
        Request this service
      </h2>
      <p className="muted-text mt-1 text-sm">
        Tell the vendor about your event. They&apos;ll reply after reviewing.
      </p>

      {created && (
        <div className="mt-4 rounded-lg border border-(--brand)/30 bg-(--brand-soft) px-3 py-2.5 text-sm text-(--text-primary)">
          Your request is <strong>pending</strong>. You can track it in{" "}
          <Link href="/dashboard/customer/bookings" className="font-medium underline">
            My Bookings
          </Link>
          .
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
        <FieldGroup>
          <Field data-invalid={Boolean(errors.eventDate)}>
            <FieldLabel htmlFor="eventDate">Event Date *</FieldLabel>
            <div className="relative">
              <CalendarDays
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--text-secondary)"
              />
              <Input
                id="eventDate"
                type="date"
                className="pl-9"
                value={eventDate}
                onChange={(event) => setValue("eventDate", event.target.value)}
                aria-invalid={Boolean(errors.eventDate)}
              />
            </div>
            <FieldError errors={errors.eventDate ? [{ message: errors.eventDate }] : undefined} />
          </Field>

          <Field data-invalid={Boolean(errors.eventLocation)}>
            <FieldLabel htmlFor="eventLocation">Event Location *</FieldLabel>
            <div className="relative">
              <MapPin
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--text-secondary)"
              />
              <Input
                id="eventLocation"
                className="pl-9"
                placeholder="Dhaka, Bangladesh"
                value={eventLocation}
                onChange={(event) => setValue("eventLocation", event.target.value)}
                aria-invalid={Boolean(errors.eventLocation)}
              />
            </div>
            <FieldError
              errors={
                errors.eventLocation
                  ? [{ message: errors.eventLocation }]
                  : undefined
              }
            />
          </Field>

          <Field data-invalid={Boolean(errors.message)}>
            <FieldLabel htmlFor="message">Message for the vendor *</FieldLabel>
            <Textarea
              id="message"
              rows={4}
              placeholder="Tell us about your wedding date, guest count and what you need..."
              value={message}
              onChange={(event) => setValue("message", event.target.value)}
              aria-invalid={Boolean(errors.message)}
            />
            <FieldDescription>Maximum 1000 characters.</FieldDescription>
            <FieldError errors={errors.message ? [{ message: errors.message }] : undefined} />
          </Field>
        </FieldGroup>

        <Button type="submit" disabled={submitting} className="w-full rounded-full">
          {submitting ? (
            <>
              <Loader2 className="animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Send /> Send Booking Request
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
