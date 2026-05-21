import { Metadata } from "next";
import RegisterClient from "@/components/auth/RegisterClient";

export const metadata: Metadata = {
    title: "Create Account | JOYSHIDDENBEAUTY",
    description: "Join the Inner Circle. Unlock exclusive access to new collections, bespoke offers, and beauty insights.",
};

export default function RegisterPage() {
    return <RegisterClient />;
}
