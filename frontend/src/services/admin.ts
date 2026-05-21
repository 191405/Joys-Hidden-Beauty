import { apiFetch } from "@/lib/api";

// ════════════ Types ════════════

export interface DashboardStats {
    total_users: number;
    total_appointments: number;
    appointments_today: number;
    pending_appointments: number;
    confirmed_appointments: number;
    total_revenue: number;
    active_services: number;
    active_staff: number;
}

export interface AppointmentItem {
    id: number;
    user_name: string;
    user_email: string;
    service_name: string;
    staff_name: string;
    start_time: string;
    end_time: string;
    status: string;
    opay_reference: string | null;
    booked_at: string;
}

export interface UserItem {
    id: number;
    email: string;
    first_name: string;
    phone: string;
    role: string;
    created_at: string;
    appointment_count: number;
}

export interface ServiceItem {
    id: number;
    name: string;
    description: string;
    duration_minutes: number;
    buffer_minutes: number;
    price: number;
    category: string;
    image_url: string;
    is_active: boolean;
}

export interface StaffItem {
    id: number;
    name: string;
    email: string | null;
    phone: string;
    bio: string;
    is_active: boolean;
}

export interface PaymentItem {
    appointment_id: number;
    opay_reference: string | null;
    service_name: string;
    user_name: string;
    amount: number;
    status: string;
    booked_at: string;
}

export interface WaitlistAdminItem {
    id: number;
    name: string;
    email: string;
    status: string;
    joined_at: string;
}

export interface ChurnAnalyticsItem {
    user_id: number;
    name: string;
    email: string;
    last_active: string;
    emailed_at: string | null;
    recovered: boolean;
}

// ════════════ API Client ════════════

export const AdminService = {
    // Dashboard
    async getDashboard(): Promise<DashboardStats> {
        return apiFetch<DashboardStats>("/admin/dashboard");
    },

    // Appointments
    async getAppointments(status?: string, page = 1): Promise<AppointmentItem[]> {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (status) params.set("status", status);
        return apiFetch<AppointmentItem[]>(`/admin/appointments?${params}`);
    },

    async updateAppointmentStatus(id: number, status: string): Promise<{ message: string }> {
        return apiFetch(`/admin/appointments/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        });
    },

    // Users
    async getUsers(search?: string, page = 1): Promise<UserItem[]> {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (search) params.set("search", search);
        return apiFetch<UserItem[]>(`/admin/users?${params}`);
    },

    // Services
    async getServices(): Promise<ServiceItem[]> {
        return apiFetch<ServiceItem[]>("/admin/services");
    },

    async createService(data: Omit<ServiceItem, "id" | "is_active">): Promise<ServiceItem> {
        return apiFetch<ServiceItem>("/admin/services", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    async updateService(id: number, data: Partial<ServiceItem>): Promise<ServiceItem> {
        return apiFetch<ServiceItem>(`/admin/services/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    async deactivateService(id: number): Promise<{ message: string }> {
        return apiFetch(`/admin/services/${id}`, { method: "DELETE" });
    },

    // Staff
    async getStaff(): Promise<StaffItem[]> {
        return apiFetch<StaffItem[]>("/admin/staff");
    },

    async createStaff(data: Omit<StaffItem, "id" | "is_active">): Promise<StaffItem> {
        return apiFetch<StaffItem>("/admin/staff", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    // Payments
    async getPayments(status?: string, page = 1): Promise<PaymentItem[]> {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (status) params.set("status", status);
        return apiFetch<PaymentItem[]>(`/admin/payments?${params}`);
    },

    // Waitlist
    async getWaitlist(): Promise<WaitlistAdminItem[]> {
        return apiFetch<WaitlistAdminItem[]>("/admin/waitlist");
    },

    async getChurnAnalytics(): Promise<ChurnAnalyticsItem[]> {
        return apiFetch<ChurnAnalyticsItem[]>("/admin/churn/analytics");
    },

    async contactWaitlistUser(id: number): Promise<{ message: string }> {
        return apiFetch(`/admin/waitlist/${id}/contact`, {
            method: "PATCH",
        });
    },
};
