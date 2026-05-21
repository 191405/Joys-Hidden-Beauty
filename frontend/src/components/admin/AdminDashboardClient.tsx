"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";
import {
    AdminService,
    type DashboardStats,
    type AppointmentItem,
    type ServiceItem,
    type PaymentItem,
    type UserItem,
    type StaffItem,
    type WaitlistAdminItem,
    type ChurnAnalyticsItem
} from "@/services/admin";

type AdminTab = "dashboard" | "appointments" | "services" | "staff" | "users" | "payments" | "waitlist" | "retention" | "ai_integration";

const STATUS_COLORS: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-800",
    completed: "bg-blue-100 text-blue-800",
    pending: "bg-amber-100 text-amber-800",
    held: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-gray-100 text-gray-800",
    paid: "bg-emerald-100 text-emerald-800",
};

export default function AdminDashboardClient() {
    const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [staff, setStaff] = useState<StaffItem[]>([]);
    const [users, setUsers] = useState<UserItem[]>([]);
    const [payments, setPayments] = useState<PaymentItem[]>([]);
    const [waitlist, setWaitlist] = useState<WaitlistAdminItem[]>([]);
    const [retentionStats, setRetentionStats] = useState<ChurnAnalyticsItem[]>([]);
    const [statusFilter, setStatusFilter] = useState("");
    const router = useRouter();

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/auth/login");
            return;
        }
        loadDashboard();
    }, [router]);

    useEffect(() => {
        if (activeTab === "appointments") loadAppointments();
        if (activeTab === "services") loadServices();
        if (activeTab === "staff") loadStaff();
        if (activeTab === "users") loadUsers();
        if (activeTab === "payments") loadPayments();
        if (activeTab === "waitlist") loadWaitlist();
        if (activeTab === "retention") loadRetention();
    }, [activeTab, statusFilter]);

    async function loadRetention() {
        try {
            const data = await AdminService.getChurnAnalytics();
            setRetentionStats(data);
        } catch (e) { console.error(e); }
    }

    async function loadDashboard() {
        try {
            const data = await AdminService.getDashboard();
            setStats(data);
        } catch {
            router.push("/account");
        } finally {
            setLoading(false);
        }
    }

    async function loadAppointments() {
        try {
            const data = await AdminService.getAppointments(statusFilter || undefined);
            setAppointments(data);
        } catch (e) { console.error(e); }
    }

    async function loadServices() {
        try {
            const data = await AdminService.getServices();
            setServices(data);
        } catch (e) { console.error(e); }
    }

    async function loadStaff() {
        try {
            const data = await AdminService.getStaff();
            setStaff(data);
        } catch (e) { console.error(e); }
    }

    async function loadUsers() {
        try {
            const data = await AdminService.getUsers();
            setUsers(data);
        } catch (e) { console.error(e); }
    }

    async function loadPayments() {
        try {
            const data = await AdminService.getPayments(statusFilter || undefined);
            setPayments(data);
        } catch (e) { console.error(e); }
    }

    async function loadWaitlist() {
        try {
            const data = await AdminService.getWaitlist();
            setWaitlist(data);
        } catch (e) { console.error(e); }
    }

    async function handleStatusUpdate(appointmentId: number, newStatus: string) {
        try {
            await AdminService.updateAppointmentStatus(appointmentId, newStatus);
            loadAppointments();
            loadDashboard();
        } catch (e) { console.error(e); }
    }

    async function handleContactWaitlist(id: number) {
        try {
            await AdminService.contactWaitlistUser(id);
            loadWaitlist();
        } catch (e) { console.error("Could not contact user", e); }
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-40 flex items-start justify-center">
                <div className="animate-pulse text-center">
                    <div className="h-8 w-48 bg-[var(--color-mist)] mx-auto mb-4" />
                    <div className="h-4 w-32 bg-[var(--color-mist)] mx-auto" />
                </div>
            </div>
        );
    }

    const tabs: { key: AdminTab; label: string }[] = [
        { key: "dashboard", label: "Dashboard" },
        { key: "appointments", label: "Appointments" },
        { key: "services", label: "Services" },
        { key: "staff", label: "Staff" },
        { key: "users", label: "Clients" },
        { key: "payments", label: "Payments" },
        { key: "waitlist", label: "Waitlist" },
        { key: "retention", label: "Retention" },
        { key: "ai_integration", label: "AI Center (Locked)" }
    ];

    const formatDate = (iso: string) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("en-NG", {
            month: "short", day: "numeric", year: "numeric",
        });
    };

    const formatTime = (iso: string) => {
        if (!iso) return "";
        return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    };

    return (
        <div className="pt-28 pb-20 min-h-screen bg-[var(--color-canvas)]">
            <div className="max-w-[1200px] mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-10">
                    <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.3em] uppercase text-[var(--color-gold)] mb-3">
                        Administration
                    </p>
                    <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl mb-2">
                        Command Center
                    </h1>
                    <div className="divider-gold mx-auto" />
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-6 mb-10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => { if (tab.key !== "ai_integration") { setActiveTab(tab.key); setStatusFilter(""); } }}
                            disabled={tab.key === "ai_integration"}
                            className={`text-xs tracking-[0.12em] uppercase pb-1.5 border-b-2 transition-all px-1 ${
                                tab.key === "ai_integration" 
                                    ? "text-[var(--color-mist)] border-transparent cursor-not-allowed opacity-50"
                                    : activeTab === tab.key
                                        ? "text-[var(--color-ink)] border-[var(--color-gold)]"
                                        : "text-[var(--color-slate)] border-transparent hover:text-[var(--color-ink)]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ═══ Dashboard Tab ═══ */}
                {activeTab === "dashboard" && stats && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                            {[
                                { label: "Total Clients", value: stats.total_users, accent: false },
                                { label: "Bookings Today", value: stats.appointments_today, accent: true },
                                { label: "Revenue", value: `₦${stats.total_revenue.toLocaleString()}`, accent: false },
                                { label: "Pending", value: stats.pending_appointments, accent: stats.pending_appointments > 0 },
                            ].map((card) => (
                                <div
                                    key={card.label}
                                    className={`p-6 border text-center transition-all ${
                                        card.accent
                                            ? "border-[var(--color-gold)] bg-[rgba(212,175,55,0.04)]"
                                            : "border-[rgba(26,26,26,0.08)]"
                                    }`}
                                >
                                    <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-slate)] mb-2 font-[family-name:var(--font-cinzel)]">
                                        {card.label}
                                    </p>
                                    <p className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl">
                                        {card.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Total Bookings", value: stats.total_appointments },
                                { label: "Confirmed", value: stats.confirmed_appointments },
                                { label: "Active Services", value: stats.active_services },
                                { label: "Active Staff", value: stats.active_staff },
                            ].map((card) => (
                                <div key={card.label} className="p-5 border border-[rgba(26,26,26,0.08)] text-center">
                                    <p className="text-[10px] tracking-[0.12em] uppercase text-[var(--color-slate)] mb-2">
                                        {card.label}
                                    </p>
                                    <p className="font-[family-name:var(--font-playfair)] text-xl">{card.value}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ═══ Appointments Tab ═══ */}
                {activeTab === "appointments" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {["", "held", "pending", "confirmed", "completed", "cancelled", "no_show"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`text-[10px] tracking-[0.1em] uppercase px-4 py-2 border transition-all ${
                                        statusFilter === s
                                            ? "bg-[var(--color-gold)] text-[var(--color-canvas)] border-[var(--color-gold)]"
                                            : "border-[rgba(26,26,26,0.12)] hover:border-[var(--color-gold)]"
                                    }`}
                                >
                                    {s || "All"}
                                </button>
                            ))}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[rgba(26,26,26,0.08)]">
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Client</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Service</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Date</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Time</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Staff</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Status</th>
                                        <th className="text-right py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((apt) => (
                                        <tr key={apt.id} className="border-b border-[rgba(26,26,26,0.04)] hover:bg-[var(--color-mist)] transition-colors">
                                            <td className="py-3">
                                                <p className="font-medium">{apt.user_name}</p>
                                                <p className="text-xs text-[var(--color-slate)]">{apt.user_email}</p>
                                            </td>
                                            <td className="py-3">{apt.service_name}</td>
                                            <td className="py-3">{formatDate(apt.start_time)}</td>
                                            <td className="py-3">{formatTime(apt.start_time)}</td>
                                            <td className="py-3">{apt.staff_name}</td>
                                            <td className="py-3">
                                                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_COLORS[apt.status] || "bg-gray-100"}`}>
                                                    {apt.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <select
                                                    defaultValue=""
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            handleStatusUpdate(apt.id, e.target.value);
                                                            e.target.value = "";
                                                        }
                                                    }}
                                                    className="text-xs border border-[rgba(26,26,26,0.12)] px-2 py-1 bg-transparent"
                                                >
                                                    <option value="">Update…</option>
                                                    <option value="confirmed">Confirm</option>
                                                    <option value="completed">Complete</option>
                                                    <option value="cancelled">Cancel</option>
                                                    <option value="no_show">No Show</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                    {appointments.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-[var(--color-slate)]">
                                                No appointments found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* ═══ Services Tab ═══ */}
                {activeTab === "services" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="space-y-3">
                            {services.map((s) => (
                                <div
                                    key={s.id}
                                    className={`flex items-center justify-between p-5 border transition-all ${
                                        s.is_active ? "border-[rgba(26,26,26,0.08)]" : "border-red-200 bg-red-50/30 opacity-60"
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-medium">{s.name}</h3>
                                            <span className="text-[10px] tracking-[0.1em] uppercase text-[var(--color-gold)]">
                                                {s.category}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--color-slate)] mt-1">
                                            {s.duration_minutes} min · {s.buffer_minutes} min buffer
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-[family-name:var(--font-playfair)] text-lg">₦{s.price.toLocaleString()}</p>
                                        <span className={`text-[10px] uppercase ${s.is_active ? "text-emerald-600" : "text-red-500"}`}>
                                            {s.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {services.length === 0 && (
                                <p className="text-center text-[var(--color-slate)] py-12">No services found</p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ═══ Staff Tab ═══ */}
                {activeTab === "staff" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {staff.map((s) => (
                                <div key={s.id} className="p-5 border border-[rgba(26,26,26,0.08)]">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium">{s.name}</h3>
                                        <span className={`text-[10px] uppercase ${s.is_active ? "text-emerald-600" : "text-red-500"}`}>
                                            {s.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    {s.email && <p className="text-sm text-[var(--color-slate)]">{s.email}</p>}
                                    {s.phone && <p className="text-sm text-[var(--color-slate)]">{s.phone}</p>}
                                    {s.bio && <p className="text-sm text-[var(--color-slate)] mt-2 italic">{s.bio}</p>}
                                </div>
                            ))}
                            {staff.length === 0 && (
                                <p className="text-center text-[var(--color-slate)] py-12 col-span-2">No staff found</p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ═══ Users Tab ═══ */}
                {activeTab === "users" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[rgba(26,26,26,0.08)]">
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Name</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Email</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Phone</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Bookings</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id} className="border-b border-[rgba(26,26,26,0.04)] hover:bg-[var(--color-mist)] transition-colors">
                                            <td className="py-3 font-medium">{u.first_name}</td>
                                            <td className="py-3 text-[var(--color-slate)]">{u.email}</td>
                                            <td className="py-3">{u.phone || "—"}</td>
                                            <td className="py-3">{u.appointment_count}</td>
                                            <td className="py-3 text-[var(--color-slate)]">{formatDate(u.created_at)}</td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-[var(--color-slate)]">
                                                No clients found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* ═══ Payments Tab ═══ */}
                {activeTab === "payments" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {["", "pending", "confirmed", "completed", "cancelled"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`text-[10px] tracking-[0.1em] uppercase px-4 py-2 border transition-all ${
                                        statusFilter === s
                                            ? "bg-[var(--color-gold)] text-[var(--color-canvas)] border-[var(--color-gold)]"
                                            : "border-[rgba(26,26,26,0.12)] hover:border-[var(--color-gold)]"
                                    }`}
                                >
                                    {s || "All"}
                                </button>
                            ))}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[rgba(26,26,26,0.08)]">
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Reference</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Client</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Service</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Amount</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Status</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr key={p.appointment_id} className="border-b border-[rgba(26,26,26,0.04)] hover:bg-[var(--color-mist)] transition-colors">
                                            <td className="py-3 font-mono text-xs">{p.opay_reference || "—"}</td>
                                            <td className="py-3">{p.user_name}</td>
                                            <td className="py-3">{p.service_name}</td>
                                            <td className="py-3 font-medium">₦{p.amount.toLocaleString()}</td>
                                            <td className="py-3">
                                                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_COLORS[p.status] || "bg-gray-100"}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-[var(--color-slate)]">{formatDate(p.booked_at)}</td>
                                        </tr>
                                    ))}
                                    {payments.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-[var(--color-slate)]">
                                                No payment records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* ═══ Waitlist Tab ═══ */}
                {activeTab === "waitlist" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[rgba(26,26,26,0.08)]">
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Name</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Email</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Date Joined</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Status</th>
                                        <th className="text-right py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {waitlist.map((entry) => (
                                        <tr key={entry.id} className="border-b border-[rgba(26,26,26,0.04)] hover:bg-[var(--color-mist)] transition-colors">
                                            <td className="py-3 font-medium">{entry.name}</td>
                                            <td className="py-3 text-[var(--color-slate)]">{entry.email}</td>
                                            <td className="py-3 text-[var(--color-slate)]">{formatDate(entry.joined_at)}</td>
                                            <td className="py-3">
                                                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${entry.status === "contacted" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                                    {entry.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                {entry.status === "pending" ? (
                                                    <button
                                                        onClick={() => handleContactWaitlist(entry.id)}
                                                        className="text-[10px] uppercase tracking-wider text-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors"
                                                    >
                                                        Mark & Alert
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-slate)]">Sent</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {waitlist.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-[var(--color-slate)]">
                                                No waitlist entries
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* ═══ Retention Tab ═══ */}
                {activeTab === "retention" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="mb-8">
                            <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[var(--color-ink)] mb-2">
                                At-Risk VIPs
                            </h2>
                            <p className="text-[var(--color-slate)] text-sm">
                                Clients who have completed an order or booking but have not been active in the last 60 days. The system automatically emails them at 3:00 AM.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[rgba(26,26,26,0.08)]">
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Client Name</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Contact</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Last Active</th>
                                        <th className="text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal">Auto-Recovery Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {retentionStats.map((entry) => (
                                        <tr key={entry.user_id} className="border-b border-[rgba(26,26,26,0.04)] hover:bg-[var(--color-mist)] transition-colors">
                                            <td className="py-3 font-medium text-[var(--color-ink)]">{entry.name}</td>
                                            <td className="py-3 text-[var(--color-slate)]">{entry.email}</td>
                                            <td className="py-3">
                                                <span className="text-[var(--color-slate)]">{formatDate(entry.last_active)}</span>
                                            </td>
                                            <td className="py-3">
                                                {entry.emailed_at ? (
                                                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                                                        Emailed: {formatDate(entry.emailed_at)}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                                                        Pending Nightly Scan
                                                    </span>
                                                )}
                                                {entry.recovered && (
                                                    <span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                                        Recovered
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {retentionStats.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-[var(--color-slate)]">
                                                All VIPs are actively engaged. Superb!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
