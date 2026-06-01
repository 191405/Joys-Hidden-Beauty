import { apiFetch } from "@/lib/api";

export interface Service {
    id: number;
    name: string;
    description: string;
    duration_minutes: number;
    price: number;
    category: string;
    image_url: string;
}

export interface AvailabilitySlot {
    staff_id: number;
    staff_name: string;
    start_time: string; // ISO
    end_time: string;   // ISO
}

export interface HoldResponse {
    appointment_id: number;
    service: string;
    staff: string;
    start_time: string;
    held_until: string;
}

export interface PaymentInitiateResponse {
    cashier_url: string;
    reference: string;
    order_no: string;
}

export interface PaymentStatusResponse {
    reference: string;
    status: string;
    amount: number | null;
    message: string;
}

export const BookingService = {
    async getServices(): Promise<Service[]> {
        return apiFetch<Service[]>("/booking/services");
    },

    async checkAvailability(serviceId: number, date: Date): Promise<AvailabilitySlot[]> {
        const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
        return apiFetch<AvailabilitySlot[]>(`/booking/availability?service_id=${serviceId}&date=${dateStr}`);
    },

    async holdSlot(serviceId: number, staffId: number, startTime: string): Promise<HoldResponse> {
        return apiFetch<HoldResponse>("/booking/hold", {
            method: "POST",
            body: JSON.stringify({ service_id: serviceId, staff_id: staffId, start_time: startTime }),
        });
    },

    async confirmBooking(appointmentId: number): Promise<unknown> {
        return apiFetch(`/booking/confirm/${appointmentId}`, {
            method: "POST",
        });
    },

    async initiatePayment(appointmentIds: number[]): Promise<PaymentInitiateResponse> {
        return apiFetch<PaymentInitiateResponse>("/payment/initiate", {
            method: "POST",
            body: JSON.stringify({ appointment_ids: appointmentIds }),
        });
    },

    async verifyPayment(reference: string): Promise<PaymentStatusResponse> {
        return apiFetch<PaymentStatusResponse>(`/payment/verify/${reference}`);
    },
};

