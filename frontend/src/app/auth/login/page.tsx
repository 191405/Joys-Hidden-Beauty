import { Metadata } from "next";
import LoginClient from "@/components/auth/LoginClient";

export const metadata: Metadata = {
    title: "Sign In | JOYSHIDDENBEAUTY",
    description: "Access your account to view orders, manage appointments, and update your beauty profile.",
};

export default function LoginPage() {
    return <LoginClient />;
}
