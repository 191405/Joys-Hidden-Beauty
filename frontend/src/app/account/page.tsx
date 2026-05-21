import { Metadata } from "next";
import AccountClient from "@/components/account/AccountClient";

export const metadata: Metadata = {
    title: "My Account | JOYSHIDDENBEAUTY",
    description: "Manage your profile, view upcoming appointments, and update your beauty preferences.",
};

export default function AccountPage() {
    return <AccountClient />;
}
