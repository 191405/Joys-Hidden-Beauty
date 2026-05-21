import type { Metadata } from "next";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export const metadata: Metadata = {
    title: "Admin Dashboard — JOYSHIDDENBEAUTY",
    description: "Manage appointments, services, staff, clients, and payments.",
};

export default function AdminPage() {
    return <AdminDashboardClient />;
}
