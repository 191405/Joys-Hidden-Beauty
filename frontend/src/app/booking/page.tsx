import { Metadata } from "next";
import BookingClient from "@/components/booking/BookingClient";

export const metadata: Metadata = {
    title: "Book an Appointment | JOYSHIDDENBEAUTY",
    description: "Reserve your bespoke beauty experience. Select your service, date, and time for a moment of pure quality.",
};

export default function BookingPage() {
    return <BookingClient />;
}
