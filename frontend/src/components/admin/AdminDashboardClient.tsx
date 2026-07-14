"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    type ChurnAnalyticsItem,
} from "@/services/admin";

/* ═══════════════════════════
   TYPES & CONSTANTS
═══════════════════════════ */

type AdminTab = "dashboard" | "appointments" | "services" | "staff" | "users" | "payments" | "waitlist" | "retention" | "settings";

const STATUS_COLORS: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-800",
    completed: "bg-blue-100 text-blue-800",
    pending: "bg-amber-100 text-amber-800",
    held: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-gray-100 text-gray-800",
    paid: "bg-emerald-100 text-emerald-800",
};

const SIDEBAR_ITEMS: { key: AdminTab; label: string; icon: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: "◈" },
    { key: "appointments", label: "Appointments", icon: "◷" },
    { key: "services", label: "Services", icon: "✦" },
    { key: "staff", label: "Staff", icon: "◉" },
    { key: "users", label: "Clients", icon: "◎" },
    { key: "payments", label: "Payments", icon: "₦" },
    { key: "waitlist", label: "Waitlist", icon: "◇" },
    { key: "retention", label: "Retention", icon: "↻" },
    { key: "settings", label: "Settings", icon: "⚙" },
];

/* ═══════════════════════════
   UTILITY FUNCTIONS
═══════════════════════════ */

const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (iso: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

function exportToCSV(data: Record<string, unknown>[], filename: string) {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(","),
        ...data.map((row) => headers.map((h) => `"${String(row[h] ?? "")}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

/* ═══════════════════════════
   MODAL COMPONENT
═══════════════════════════ */

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-6 border-b border-[rgba(26,26,26,0.08)]">
                        <h2 className="font-[family-name:var(--font-playfair)] text-xl">{title}</h2>
                        <button onClick={onClose} className="text-[var(--color-slate)] hover:text-[var(--color-ink)] text-lg">✕</button>
                    </div>
                    <div className="p-6">{children}</div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

/* ═══════════════════════════
   INLINE TOAST
═══════════════════════════ */

function useToast() {
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const show = useCallback((msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    }, []);
    const ToastEl = toast ? (
        <div className={`fixed bottom-6 right-6 z-[200] toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
            {toast.msg}
        </div>
    ) : null;
    return { show, ToastEl };
}

/* ═══════════════════════════
   MAIN COMPONENT
═══════════════════════════ */

export default function AdminDashboardClient() {
    const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
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
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const { show: showToast, ToastEl } = useToast();

    // Modal states
    const [serviceModalOpen, setServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceItem | null>(null);
    const [staffModalOpen, setStaffModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);

    // Service form
    const [svcForm, setSvcForm] = useState({ name: "", description: "", duration_minutes: 60, buffer_minutes: 15, price: 0, category: "studio", image_url: "" });
    // Staff form
    const [staffForm, setStaffForm] = useState({ name: "", email: "", phone: "", bio: "" });

    useEffect(() => {
        const token = getToken();
        if (!token) { router.push("/auth/login"); return; }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, statusFilter]);

    /* ─── Loaders ─── */
    async function loadDashboard() {
        try { setStats(await AdminService.getDashboard()); }
        catch { router.push("/account"); }
        finally { setLoading(false); }
    }
    async function loadAppointments() { try { setAppointments(await AdminService.getAppointments(statusFilter || undefined)); } catch (e) { console.error(e); } }
    async function loadServices() { try { setServices(await AdminService.getServices()); } catch (e) { console.error(e); } }
    async function loadStaff() { try { setStaff(await AdminService.getStaff()); } catch (e) { console.error(e); } }
    async function loadUsers() { try { setUsers(await AdminService.getUsers(searchQuery || undefined)); } catch (e) { console.error(e); } }
    async function loadPayments() { try { setPayments(await AdminService.getPayments(statusFilter || undefined)); } catch (e) { console.error(e); } }
    async function loadWaitlist() { try { setWaitlist(await AdminService.getWaitlist()); } catch (e) { console.error(e); } }
    async function loadRetention() { try { setRetentionStats(await AdminService.getChurnAnalytics()); } catch (e) { console.error(e); } }

    /* ─── Actions ─── */
    async function handleStatusUpdate(id: number, newStatus: string) {
        try { await AdminService.updateAppointmentStatus(id, newStatus); showToast("Status updated"); loadAppointments(); loadDashboard(); }
        catch { showToast("Failed to update status", "error"); }
    }

    async function handleContactWaitlist(id: number) {
        try { await AdminService.contactWaitlistUser(id); showToast("User contacted"); loadWaitlist(); }
        catch { showToast("Failed to contact user", "error"); }
    }

    async function handleSaveService() {
        try {
            if (editingService) {
                await AdminService.updateService(editingService.id, svcForm);
                showToast("Service updated");
            } else {
                await AdminService.createService(svcForm);
                showToast("Service created");
            }
            setServiceModalOpen(false);
            setEditingService(null);
            loadServices();
        } catch { showToast("Failed to save service", "error"); }
    }

    async function handleToggleService(svc: ServiceItem) {
        try {
            if (svc.is_active) { await AdminService.deactivateService(svc.id); showToast("Service deactivated"); }
            else { await AdminService.updateService(svc.id, { is_active: true }); showToast("Service activated"); }
            loadServices();
        } catch { showToast("Failed to toggle service", "error"); }
    }

    async function handleSaveStaff() {
        try {
            await AdminService.createStaff(staffForm);
            showToast("Staff member added");
            setStaffModalOpen(false);
            loadStaff();
        } catch { showToast("Failed to add staff", "error"); }
    }

    function openServiceModal(svc?: ServiceItem) {
        if (svc) {
            setEditingService(svc);
            setSvcForm({ name: svc.name, description: svc.description, duration_minutes: svc.duration_minutes, buffer_minutes: svc.buffer_minutes, price: svc.price, category: svc.category, image_url: svc.image_url });
        } else {
            setEditingService(null);
            setSvcForm({ name: "", description: "", duration_minutes: 60, buffer_minutes: 15, price: 0, category: "studio", image_url: "" });
        }
        setServiceModalOpen(true);
    }

    function openStaffModal() {
        setEditingStaff(null);
        setStaffForm({ name: "", email: "", phone: "", bio: "" });
        setStaffModalOpen(true);
    }

    /* ─── Filter users by search ─── */
    const filteredUsers = searchQuery
        ? users.filter((u) => u.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
        : users;

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

    const thCls = "text-left py-3 text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] font-normal whitespace-nowrap pr-4";
    const inputCls = "w-full border border-[rgba(26,26,26,0.12)] px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors";

    return (
        <div className="flex min-h-screen bg-[#fafaf8]">
            {/* ═══════════════════════════════════════ */}
            {/* SIDEBAR                                */}
            {/* ═══════════════════════════════════════ */}

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`fixed top-0 left-0 h-full bg-[#0a0a0a] text-white z-50 transition-transform duration-300 w-[240px] flex flex-col
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>

                {/* Brand */}
                <div className="p-6 pb-4 border-b border-white/[0.06]">
                    <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.3em] uppercase text-[var(--color-gold)] mb-1">
                        Administration
                    </p>
                    <h1 className="font-[family-name:var(--font-playfair)] text-lg">Command Center</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    {SIDEBAR_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => { setActiveTab(item.key); setStatusFilter(""); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-all ${
                                activeTab === item.key
                                    ? "bg-white/[0.06] text-[var(--color-gold)] border-r-2 border-[var(--color-gold)]"
                                    : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                            }`}
                        >
                            <span className="text-base w-5 text-center">{item.icon}</span>
                            <span className="tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-6 border-t border-white/[0.06]">
                    <button onClick={() => router.push("/")} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                        ← Back to Site
                    </button>
                </div>
            </aside>

            {/* ═══════════════════════════════════════ */}
            {/* MAIN CONTENT                           */}
            {/* ═══════════════════════════════════════ */}

            <main className="flex-1 min-w-0">
                {/* Top Bar */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[rgba(26,26,26,0.06)] px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-xl" onClick={() => setSidebarOpen(true)}>☰</button>
                        <h2 className="font-[family-name:var(--font-playfair)] text-lg capitalize">{activeTab === "users" ? "Clients" : activeTab}</h2>
                    </div>
                    {stats && (
                        <div className="hidden sm:flex items-center gap-6 text-xs text-[var(--color-slate)]">
                            <span>Today: <strong className="text-[var(--color-ink)]">{stats.appointments_today}</strong> bookings</span>
                            <span className="w-px h-4 bg-[rgba(26,26,26,0.1)]" />
                            <span>Pending: <strong className="text-amber-600">{stats.pending_appointments}</strong></span>
                            <span className="w-px h-4 bg-[rgba(26,26,26,0.1)]" />
                            <span>Revenue: <strong className="text-[var(--color-ink)]">₦{stats.total_revenue.toLocaleString()}</strong></span>
                        </div>
                    )}
                </div>

                <div className="p-6 lg:p-8 max-w-[1200px]">

                    {/* ═══ Dashboard ═══ */}
                    {activeTab === "dashboard" && stats && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: "Total Clients", value: stats.total_users, accent: false },
                                    { label: "Bookings Today", value: stats.appointments_today, accent: true },
                                    { label: "Revenue", value: `₦${stats.total_revenue.toLocaleString()}`, accent: false },
                                    { label: "Pending", value: stats.pending_appointments, accent: stats.pending_appointments > 0 },
                                ].map((card) => (
                                    <div key={card.label} className={`p-6 border text-center bg-white transition-all ${card.accent ? "border-[var(--color-gold)] bg-[rgba(212,175,55,0.04)]" : "border-[rgba(26,26,26,0.08)]"}`}>
                                        <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-slate)] mb-2 font-[family-name:var(--font-cinzel)]">{card.label}</p>
                                        <p className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl">{card.value}</p>
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
                                    <div key={card.label} className="p-5 border border-[rgba(26,26,26,0.08)] bg-white text-center">
                                        <p className="text-[10px] tracking-[0.12em] uppercase text-[var(--color-slate)] mb-2">{card.label}</p>
                                        <p className="font-[family-name:var(--font-playfair)] text-xl">{card.value}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ Appointments ═══ */}
                    {activeTab === "appointments" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {["", "held", "pending", "confirmed", "completed", "cancelled", "no_show"].map((s) => (
                                    <button key={s} onClick={() => setStatusFilter(s)} className={`text-[10px] tracking-[0.1em] uppercase px-4 py-2 border transition-all ${statusFilter === s ? "bg-[var(--color-gold)] text-[var(--color-canvas)] border-[var(--color-gold)]" : "border-[rgba(26,26,26,0.12)] hover:border-[var(--color-gold)]"}`}>
                                        {s || "All"}
                                    </button>
                                ))}
                            </div>
                            <div className="overflow-x-auto bg-white border border-[rgba(26,26,26,0.06)]">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[rgba(26,26,26,0.08)]">
                                            <th className={thCls}>Client</th><th className={thCls}>Service</th><th className={thCls}>Date</th><th className={thCls}>Time</th><th className={thCls}>Staff</th><th className={thCls}>Status</th><th className={`${thCls} text-right`}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map((apt) => (
                                            <tr key={apt.id} className="border-b border-[rgba(26,26,26,0.04)] hover:bg-[var(--color-mist)] transition-colors">
                                                <td className="py-3 pr-4"><p className="font-medium">{apt.user_name}</p><p className="text-xs text-[var(--color-slate)]">{apt.user_email}</p></td>
                                                <td className="py-3 pr-4">{apt.service_name}</td>
                                                <td className="py-3 pr-4">{formatDate(apt.start_time)}</td>
                                                <td className="py-3 pr-4">{formatTime(apt.start_time)}</td>
                                                <td className="py-3 pr-4">{apt.staff_name}</td>
                                                <td className="py-3 pr-4"><span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_COLORS[apt.status] || "bg-gray-100"}`}>{apt.status}</span></td>
                                                <td className="py-3 text-right">
                                                    <select defaultValue="" onChange={(e) => { if (e.target.value) { handleStatusUpdate(apt.id, e.target.value); e.target.value = ""; } }} className="text-xs border border-[rgba(26,26,26,0.12)] px-2 py-1 bg-transparent">
                                                        <option value="">Update…</option><option value="confirmed">Confirm</option><option value="completed">Complete</option><option value="cancelled">Cancel</option><option value="no_show">No Show</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                        {appointments.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-[var(--color-slate)]">No appointments found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ Services ═══ */}
                    {activeTab === "services" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm text-[var(--color-slate)]">{services.length} services</p>
                                <button onClick={() => openServiceModal()} className="text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 bg-[var(--color-gold)] text-white hover:bg-[var(--color-gold-dark)] transition-colors">
                                    + Add Service
                                </button>
                            </div>
                            <div className="space-y-3">
                                {services.map((s) => (
                                    <div key={s.id} className={`flex items-center justify-between p-5 border bg-white transition-all ${s.is_active ? "border-[rgba(26,26,26,0.08)]" : "border-red-200 bg-red-50/30 opacity-60"}`}>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-medium">{s.name}</h3>
                                                <span className="text-[10px] tracking-[0.1em] uppercase text-[var(--color-gold)]">{s.category}</span>
                                            </div>
                                            <p className="text-sm text-[var(--color-slate)] mt-1">{s.duration_minutes} min · {s.buffer_minutes} min buffer</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-[family-name:var(--font-playfair)] text-lg">₦{s.price.toLocaleString()}</p>
                                                <span className={`text-[10px] uppercase ${s.is_active ? "text-emerald-600" : "text-red-500"}`}>{s.is_active ? "Active" : "Inactive"}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <button onClick={() => openServiceModal(s)} className="text-[10px] uppercase text-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors">Edit</button>
                                                <button onClick={() => handleToggleService(s)} className="text-[10px] uppercase text-[var(--color-slate)] hover:text-red-500 transition-colors">{s.is_active ? "Deactivate" : "Activate"}</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {services.length === 0 && <p className="text-center text-[var(--color-slate)] py-12">No services found</p>}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ Staff ═══ */}
                    {activeTab === "staff" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm text-[var(--color-slate)]">{staff.length} team members</p>
                                <button onClick={openStaffModal} className="text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 bg-[var(--color-gold)] text-white hover:bg-[var(--color-gold-dark)] transition-colors">
                                    + Add Staff
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {staff.map((s) => (
                                    <div key={s.id} className="p-5 border border-[rgba(26,26,26,0.08)] bg-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium">{s.name}</h3>
                                            <span className={`text-[10px] uppercase ${s.is_active ? "text-emerald-600" : "text-red-500"}`}>{s.is_active ? "Active" : "Inactive"}</span>
                                        </div>
                                        {s.email && <p className="text-sm text-[var(--color-slate)]">{s.email}</p>}
                                        {s.phone && <p className="text-sm text-[var(--color-slate)]">{s.phone}</p>}
                                        {s.bio && <p className="text-sm text-[var(--color-slate)] mt-2 italic">{s.bio}</p>}
                                    </div>
                                ))}
                                {staff.length === 0 && <p className="text-center text-[var(--color-slate)] py-12 col-span-2">No staff found</p>}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ Clients ═══ */}
                    {activeTab === "users" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-[rgba(26,26,26,0.12)] px-4 py-2.5 text-sm w-full max-w-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors bg-white"
                                />
                            </div>
                            <div className="overflow-x-auto bg-white border border-[rgba(26,26,26,0.06)]">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[rgba(26,26,26,0.08)]">
                                            <th className={thCls}>Name</th><th className={thCls}>Email</th><th className={thCls}>Phone</th><th className={thCls}>Bookings</th><th className={thCls}>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="border-b border-[rgba(26,26,26,0.04)] hover:bg-[var(--color-mist)] transition-colors">
                                                <td className="py-3 pr-4 font-medium">{u.first_name}</td>
                                                <td className="py-3 pr-4 text-[var(--color-slate)]">{u.email}</td>
                                                <td className="py-3 pr-4">{u.phone || "—"}</td>
                                                <td className="py-3 pr-4">{u.appointment_count}</td>
                                                <td className="py-3 text-[var(--color-slate)]">{formatDate(u.created_at)}</td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-[var(--color-slate)]">No clients found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ Payments ═══ */}
                    {activeTab === "payments" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <div className="flex flex-wrap gap-2">
                                    {["", "pending", "confirmed", "completed", "cancelled"].map((s) => (
                                        <button key={s} onClick={() => setStatusFilter(s)} className={`text-[10px] tracking-[0.1em] uppercase px-4 py-2 border transition-all ${statusFilter === s ? "bg-[var(--color-gold)] text-[var(--color-canvas)] border-[var(--color-gold)]" : "border-[rgba(26,26,26,0.12)] hover:border-[var(--color-gold)]"}`}>
                                            {s || "All"}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => exportToCSV(payments as unknown as Record<string, unknown>[], "payments-export")} className="text-[10px] tracking-[0.15em] uppercase px-4 py-2 border border-[rgba(26,26,26,0.12)] hover:border-[var(--color-gold)] transition-colors">
                                    Export CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto bg-white border border-[rgba(26,26,26,0.06)]">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[rgba(26,26,26,0.08)]">
                                            <th className={thCls}>Reference</th><th className={thCls}>Client</th><th className={thCls}>Service</th><th className={thCls}>Amount</th><th className={thCls}>Status</th><th className={thCls}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((p) => (
                                            <tr key={p.appointment_id} className="border-b border-[rgba(26,26,26,0.04)] hover:bg-[var(--color-mist)] transition-colors">
                                                <td className="py-3 pr-4 font-mono text-xs">{p.opay_reference || "—"}</td>
                                                <td className="py-3 pr-4">{p.user_name}</td>
                                                <td className="py-3 pr-4">{p.service_name}</td>
                                                <td className="py-3 pr-4 font-medium">₦{p.amount.toLocaleString()}</td>
                                                <td className="py-3 pr-4"><span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_COLORS[p.status] || "bg-gray-100"}`}>{p.status}</span></td>
                                                <td className="py-3 text-[var(--color-slate)]">{formatDate(p.booked_at)}</td>
                                            </tr>
                                        ))}
                                        {payments.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-[var(--color-slate)]">No payment records found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ Waitlist ═══ */}
                    {activeTab === "waitlist" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="overflow-x-auto bg-white border border-[rgba(26,26,26,0.06)]">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[rgba(26,26,26,0.08)]">
                                            <th className={thCls}>Name</th><th className={thCls}>Email</th><th className={thCls}>Date Joined</th><th className={thCls}>Status</th><th className={`${thCls} text-right`}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {waitlist.map((entry) => (
                                            <tr key={entry.id} className="border-b border-[rgba(26,26,26,0.04)] hover:bg-[var(--color-mist)] transition-colors">
                                                <td className="py-3 pr-4 font-medium">{entry.name}</td>
                                                <td className="py-3 pr-4 text-[var(--color-slate)]">{entry.email}</td>
                                                <td className="py-3 pr-4 text-[var(--color-slate)]">{formatDate(entry.joined_at)}</td>
                                                <td className="py-3 pr-4"><span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${entry.status === "contacted" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{entry.status}</span></td>
                                                <td className="py-3 text-right">
                                                    {entry.status === "pending" ? (
                                                        <button onClick={() => handleContactWaitlist(entry.id)} className="text-[10px] uppercase tracking-wider text-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors">Mark &amp; Alert</button>
                                                    ) : (
                                                        <span className="text-[10px] uppercase tracking-wider text-[var(--color-slate)]">Sent</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {waitlist.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-[var(--color-slate)]">No waitlist entries</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ Retention ═══ */}
                    {activeTab === "retention" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="mb-8">
                                <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[var(--color-ink)] mb-2">At-Risk VIPs</h2>
                                <p className="text-[var(--color-slate)] text-sm">Clients inactive for 60+ days. The system auto-emails them at 3:00 AM.</p>
                            </div>
                            <div className="overflow-x-auto bg-white border border-[rgba(26,26,26,0.06)]">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[rgba(26,26,26,0.08)]">
                                            <th className={thCls}>Client Name</th><th className={thCls}>Contact</th><th className={thCls}>Last Active</th><th className={thCls}>Recovery Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {retentionStats.map((entry) => (
                                            <tr key={entry.user_id} className="border-b border-[rgba(26,26,26,0.04)] hover:bg-[var(--color-mist)] transition-colors">
                                                <td className="py-3 pr-4 font-medium text-[var(--color-ink)]">{entry.name}</td>
                                                <td className="py-3 pr-4 text-[var(--color-slate)]">{entry.email}</td>
                                                <td className="py-3 pr-4"><span className="text-[var(--color-slate)]">{formatDate(entry.last_active)}</span></td>
                                                <td className="py-3">
                                                    {entry.emailed_at ? (
                                                        <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">Emailed: {formatDate(entry.emailed_at)}</span>
                                                    ) : (
                                                        <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-amber-100 text-amber-800">Pending Nightly Scan</span>
                                                    )}
                                                    {entry.recovered && <span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-blue-100 text-blue-800">Recovered</span>}
                                                </td>
                                            </tr>
                                        ))}
                                        {retentionStats.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-[var(--color-slate)]">All VIPs are actively engaged. Superb!</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ Settings ═══ */}
                    {activeTab === "settings" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="max-w-xl space-y-8">
                                <div className="bg-white border border-[rgba(26,26,26,0.08)] p-6">
                                    <h3 className="font-[family-name:var(--font-playfair)] text-lg mb-4">Business Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">Business Name</label>
                                            <input type="text" defaultValue="JOYSHIDDENBEAUTY" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">Contact Email</label>
                                            <input type="email" defaultValue="joyshiddenbeauty1@gmail.com" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">WhatsApp Number</label>
                                            <input type="text" defaultValue="+234" className={inputCls} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-[rgba(26,26,26,0.08)] p-6">
                                    <h3 className="font-[family-name:var(--font-playfair)] text-lg mb-4">Site Controls</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">Shop Visibility</p>
                                                <p className="text-xs text-[var(--color-slate)]">Show the shop page in navigation</p>
                                            </div>
                                            <button className="relative w-9 h-5 rounded-full bg-[var(--color-gold)] transition-colors">
                                                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm translate-x-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">Booking Enabled</p>
                                                <p className="text-xs text-[var(--color-slate)]">Allow new bookings through the site</p>
                                            </div>
                                            <button className="relative w-9 h-5 rounded-full bg-[var(--color-gold)] transition-colors">
                                                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm translate-x-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => showToast("Settings saved (frontend only — wire to backend as needed)")} className="text-[10px] tracking-[0.15em] uppercase px-6 py-3 bg-[var(--color-gold)] text-white hover:bg-[var(--color-gold-dark)] transition-colors">
                                    Save Settings
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* ═══ MODALS ═══ */}

            {/* Service Modal */}
            <Modal open={serviceModalOpen} onClose={() => setServiceModalOpen(false)} title={editingService ? "Edit Service" : "Create Service"}>
                <div className="space-y-4">
                    <div><label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">Service Name</label><input type="text" value={svcForm.name} onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })} className={inputCls} placeholder="e.g. Bridal Glam" /></div>
                    <div><label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">Description</label><textarea value={svcForm.description} onChange={(e) => setSvcForm({ ...svcForm, description: e.target.value })} className={`${inputCls} h-20 resize-none`} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">Duration (min)</label><input type="number" value={svcForm.duration_minutes} onChange={(e) => setSvcForm({ ...svcForm, duration_minutes: +e.target.value })} className={inputCls} /></div>
                        <div><label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">Buffer (min)</label><input type="number" value={svcForm.buffer_minutes} onChange={(e) => setSvcForm({ ...svcForm, buffer_minutes: +e.target.value })} className={inputCls} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">Price (₦)</label><input type="number" value={svcForm.price} onChange={(e) => setSvcForm({ ...svcForm, price: +e.target.value })} className={inputCls} /></div>
                        <div><label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">Category</label><select value={svcForm.category} onChange={(e) => setSvcForm({ ...svcForm, category: e.target.value })} className={inputCls}><option value="studio">Studio</option><option value="bridal">Bridal</option><option value="home">Home</option></select></div>
                    </div>
                    <div><label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">Image URL</label><input type="text" value={svcForm.image_url} onChange={(e) => setSvcForm({ ...svcForm, image_url: e.target.value })} className={inputCls} placeholder="https://..." /></div>
                    <button onClick={handleSaveService} className="w-full text-[10px] tracking-[0.15em] uppercase py-3 bg-[var(--color-gold)] text-white hover:bg-[var(--color-gold-dark)] transition-colors mt-2">
                        {editingService ? "Update Service" : "Create Service"}
                    </button>
                </div>
            </Modal>

            {/* Staff Modal */}
            <Modal open={staffModalOpen} onClose={() => setStaffModalOpen(false)} title="Add Staff Member">
                <div className="space-y-4">
                    <div><label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">Full Name</label><input type="text" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} className={inputCls} /></div>
                    <div><label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">Email</label><input type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} className={inputCls} /></div>
                    <div><label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">Phone</label><input type="text" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} className={inputCls} /></div>
                    <div><label className="block text-[10px] tracking-[0.1em] uppercase text-[var(--color-slate)] mb-1.5">Bio</label><textarea value={staffForm.bio} onChange={(e) => setStaffForm({ ...staffForm, bio: e.target.value })} className={`${inputCls} h-20 resize-none`} /></div>
                    <button onClick={handleSaveStaff} className="w-full text-[10px] tracking-[0.15em] uppercase py-3 bg-[var(--color-gold)] text-white hover:bg-[var(--color-gold-dark)] transition-colors mt-2">
                        Add Staff Member
                    </button>
                </div>
            </Modal>

            {/* Toast */}
            {ToastEl}
        </div>
    );
}
