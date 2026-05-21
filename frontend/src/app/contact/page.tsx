import ContactClient from "@/components/contact/ContactClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "The Concierge | JOYSHIDDENBEAUTY",
    description: "Elite support and bespoke assistance for our valued community.",
};

export default function ContactPage() {
    return <ContactClient />;
}
