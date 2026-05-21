"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { BookingService, type Service, type AvailabilitySlot } from "@/services/booking";


export default function BookingClient() {
    const [step, setStep] = useState(1);
    const [services, setServices] = useState<Service[]>([]);
    const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);

    // Selection State
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

    const [loading, setLoading] = useState(false);

    const [appointmentId, setAppointmentId] = useState<number | null>(null);

    // Fetch Services on Mount
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await BookingService.getServices();
                setServices(data);
            } catch (error) {
                console.error("Failed to load services", error);
                // toast.error("Could not load services. Please try again.");
            }
        };
        fetchServices();
    }, []);

    // Fetch Availability when Date/Service Changes
    useEffect(() => {
        if (selectedService && selectedDate) {
            const fetchAvailability = async () => {
                setLoading(true);
                try {
                    const slots = await BookingService.checkAvailability(selectedService.id, selectedDate);
                    setAvailableSlots(slots);
                } catch (error) {
                    console.error("Failed to load availability", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchAvailability();
        }
    }, [selectedService, selectedDate]);

    // Generate next 14 days
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        dates.push(d);
    }

    const handleHold = async () => {
        if (!selectedService || !selectedSlot) return;
        setLoading(true);
        try {
            const res = await BookingService.holdSlot(selectedService.id, selectedSlot.staff_id, selectedSlot.start_time);
            setAppointmentId(res.appointment_id);
            setStep(3);
        } catch (error) {
            console.error("Failed to hold slot", error);
            alert("This slot is no longer available.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!appointmentId) return;
        setLoading(true);
        try {
            const res = await BookingService.initiatePayment(appointmentId);
            // Redirect to OPay cashier page
            window.location.href = res.cashier_url;
        } catch (error) {
            console.error("Payment initiation failed", error);
            alert("Could not initiate payment. Please try again.");
            setLoading(false);
        }
    };

    // Helper to format time from ISO string
    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    return (
        <div className="pt-32 pb-20 min-h-screen">
            <div className="max-w-[800px] mx-auto px-6">
                {/* Spacer/Top padding handled by pt-32 above — no extra spacer needed */}

                {/* Header */}
                <RevealOnScroll>
                    <div className="text-center mb-16">
                        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl mb-4">
                            Book an Appointment
                        </h1>
                        <div className="divider-gold mx-auto" />
                    </div>
                </RevealOnScroll>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-16">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-4">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${step >= s
                                    ? "bg-[var(--color-gold)] text-[var(--color-canvas)]"
                                    : "border border-[rgba(26,26,26,0.15)] text-[var(--color-slate)]"
                                    }`}
                            >
                                {s}
                            </div>
                            {s < 3 && (
                                <div className={`w-16 h-[1px] ${step > s ? "bg-[var(--color-gold)]" : "bg-[rgba(26,26,26,0.1)]"}`} />
                            )}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Select Service */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="font-[family-name:var(--font-playfair)] text-2xl mb-8 text-center">
                                Choose Your Service
                            </h2>
                            <div className="space-y-4">
                                {services.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setSelectedService(s); setStep(2); }}
                                        className={`w-full text-left p-6 border transition-all duration-300 hover:border-[var(--color-gold)] ${selectedService?.id === s.id
                                            ? "border-[var(--color-gold)] bg-[var(--color-blush)]"
                                            : "border-[rgba(26,26,26,0.08)]"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] text-[var(--color-gold)] tracking-[0.15em] uppercase mb-1 font-[family-name:var(--font-cinzel)]">
                                                    {s.category} · {s.duration_minutes} min
                                                </p>
                                                <h3 className="font-[family-name:var(--font-playfair)] text-lg">{s.name}</h3>
                                            </div>
                                            <p className="font-[family-name:var(--font-playfair)] text-lg">₦{s.price.toLocaleString()}</p>
                                        </div>
                                    </button>
                                ))}
                                {services.length === 0 && (
                                    <div className="text-center text-[var(--color-slate)] py-8">
                                        Loading luxury services...
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Select Date & Time */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="font-[family-name:var(--font-playfair)] text-2xl mb-8 text-center">
                                Choose Your Date
                            </h2>

                            {/* Date Picker */}
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-12">
                                {dates.map((d) => {
                                    const isSelected = selectedDate?.toDateString() === d.toDateString();
                                    return (
                                        <button
                                            key={d.toISOString()}
                                            onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                                            className={`py-3 text-center transition-all duration-300 ${isSelected
                                                ? "bg-[var(--color-gold)] text-[var(--color-canvas)]"
                                                : "border border-[rgba(26,26,26,0.08)] hover:border-[var(--color-gold)]"
                                                }`}
                                        >
                                            <p className="text-[10px] uppercase">
                                                {d.toLocaleDateString("en", { weekday: "short" })}
                                            </p>
                                            <p className="text-lg font-medium">{d.getDate()}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Time Slots */}
                            {selectedDate && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <h3 className="font-[family-name:var(--font-playfair)] text-xl mb-6 text-center">
                                        Available Times
                                    </h3>
                                    {loading ? (
                                        <div className="text-center text-sm text-[var(--color-slate)]">Checking availability...</div>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
                                            {availableSlots.map((slot, idx) => {
                                                const timeLabel = formatTime(slot.start_time);
                                                const isSelected = selectedSlot?.start_time === slot.start_time;
                                                return (
                                                    <button
                                                        key={`${slot.start_time}-${idx}`}
                                                        onClick={() => {
                                                            setSelectedSlot(slot);
                                                            // Auto-advance logic could go here, but for now we let them click confirm or similar?
                                                            // Actually, in previous flow selecting time went to step 3. 
                                                            // We need to call HOLD when moving to step 3.
                                                        }}
                                                        className={`py-3 text-sm text-center transition-all duration-300 ${isSelected
                                                            ? "bg-[var(--color-gold)] text-[var(--color-canvas)]"
                                                            : "border border-[rgba(26,26,26,0.08)] hover:border-[var(--color-gold)]"
                                                            }`}
                                                    >
                                                        {timeLabel}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center text-sm text-[var(--color-slate)] mb-8">
                                            No slots available for this date.
                                        </div>
                                    )}

                                    {selectedSlot && (
                                        <div className="text-center mb-10">
                                            <button
                                                onClick={handleHold}
                                                className="btn-gold px-8 py-3"
                                            >
                                                Review & Confirm
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            <button
                                onClick={() => setStep(1)}
                                className="text-xs text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors block mx-auto"
                            >
                                ← Back to services
                            </button>
                        </motion.div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 3 && selectedService && selectedSlot && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="font-[family-name:var(--font-playfair)] text-2xl mb-8 text-center">
                                Confirm Your Appointment
                            </h2>

                            <div className="border border-[rgba(26,26,26,0.08)] p-8 mb-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-[var(--color-slate)] text-sm">Service</span>
                                        <span className="text-sm font-medium">{selectedService.name}</span>
                                    </div>
                                    <div className="divider-gold w-full !my-4 !bg-[rgba(26,26,26,0.06)]" style={{ width: "100%", background: "rgba(26,26,26,0.06)" }} />
                                    <div className="flex justify-between">
                                        <span className="text-[var(--color-slate)] text-sm">Date</span>
                                        <span className="text-sm font-medium">
                                            {selectedDate?.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--color-slate)] text-sm">Time</span>
                                        <span className="text-sm font-medium">{formatTime(selectedSlot.start_time)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--color-slate)] text-sm">Staff</span>
                                        <span className="text-sm font-medium">{selectedSlot.staff_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--color-slate)] text-sm">Duration</span>
                                        <span className="text-sm font-medium">{selectedService.duration_minutes} min</span>
                                    </div>
                                    <div className="h-[1px] bg-[rgba(26,26,26,0.06)] my-4" />
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Total</span>
                                        <span className="font-[family-name:var(--font-playfair)] text-xl">₦{selectedService.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[rgba(26,26,26,0.03)] border border-[rgba(26,26,26,0.08)] p-6 mb-8 text-center">
                                <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.1em] text-[var(--color-gold)] mb-3">
                                    SECURE PAYMENT
                                </p>
                                <p className="text-sm text-[var(--color-slate)] leading-relaxed mb-2">
                                    You&apos;ll be redirected to OPay&apos;s secure payment page to complete your booking.
                                </p>
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-gold)]">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <span className="text-[10px] tracking-wider uppercase text-[var(--color-slate)]">
                                        256-bit SSL Encrypted
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="btn-gold w-full justify-center mb-4 disabled:opacity-50"
                            >
                                {loading ? "Redirecting to payment..." : "Pay with OPay"}
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                className="text-xs text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors block mx-auto"
                            >
                                ← Change date or time
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
