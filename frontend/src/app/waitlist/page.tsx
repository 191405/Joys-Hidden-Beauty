import { Metadata } from "next";
import WaitlistClient from "@/components/waitlist/WaitlistClient";

export const metadata: Metadata = {
    title: "Join the Waitlist | JOYSHIDDENBEAUTY",
    description: "Join the Inner Circle to be the first to experience our quality beauty essentials.",
};

export default function WaitlistPage() {
    return <WaitlistClient />;
}
