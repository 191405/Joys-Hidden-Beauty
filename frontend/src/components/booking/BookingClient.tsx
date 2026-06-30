"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { BookingService, type Service, type AvailabilitySlot } from "@/services/booking";
import { formatTime } from "@/lib/formatters";

interface CartItem {
    service: Service;
    slot: AvailabilitySlot;
    date: Date;
    appointmentId: number;
}

const STAGGER = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.08 }
    }
};

const FADE_IN_UP = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
};

export default function BookingClient() {
    const [step, setStep] = useState(1);
    const [services, setServices] = useState<Service[]>([]);
    const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);

    // Active Selection State
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

    // Dynamic Multi-service Cart State
    const [bookingCart, setBookingCart] = useState<CartItem[]>([]);

    const [loading, setLoading] = useState(false);

    // Fetch Services on Mount
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await BookingService.getServices();
                setServices(data);
            } catch (error) {
                console.error("Failed to load services", error);
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

    const handleAddToCart = async () => {
        if (!selectedService || !selectedSlot || !selectedDate) return;
        setLoading(true);
        try {
            const res = await BookingService.holdSlot(selectedService.id, selectedSlot.staff_id, selectedSlot.start_time);
            
            const newItem: CartItem = {
                service: selectedService,
                slot: selectedSlot,
                date: selectedDate,
                appointmentId: res.appointment_id
            };

            setBookingCart(prev => [...prev, newItem]);
            
            // Reset active selections for next addition
            setSelectedService(null);
            setSelectedDate(null);
            setSelectedSlot(null);
            
            // Return to step 1 to let them add another or checkout
            setStep(1);
        } catch (error) {
            console.error("Failed to hold slot", error);
            alert("This slot is no longer available.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        let appointmentIds = bookingCart.map(item => item.appointmentId);
        
        // If they have an active selection not in cart, let's hold it first and add it
        if (selectedService && selectedSlot && selectedDate) {
            setLoading(true);
            try {
                const res = await BookingService.holdSlot(selectedService.id, selectedSlot.staff_id, selectedSlot.start_time);
                appointmentIds.push(res.appointment_id);
            } catch (error) {
                console.error("Failed to hold active selection", error);
                alert("The selected slot is no longer available.");
                setLoading(false);
                return;
            }
        }

        if (appointmentIds.length === 0) {
            alert("Please select at least one service before proceeding.");
            return;
        }

        setLoading(true);
        try {
            const res = await BookingService.initiatePayment(appointmentIds);
            // Redirect to secure OPay Checkout API
            window.location.href = res.cashier_url;
        } catch (error) {
            console.error("Payment initiation failed", error);
            alert("Could not initiate payment. Please try again.");
            setLoading(false);
        }
    };

    // Financial calculations
    const getCartTotal = () => bookingCart.reduce((sum, item) => sum + item.service.price, 0);
    const getActiveTotal = () => selectedService ? selectedService.price : 0;
    const getTotalPrice = () => getCartTotal() + getActiveTotal();
    const getDepositTotal = () => roundToTwo(getTotalPrice() * 0.30);
    const getRemainingTotal = () => roundToTwo(getTotalPrice() * 0.70);

    const roundToTwo = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

    return (
        <div className="pt-32 pb-20 min-h-screen relative">
            <div className="max-w-[850px] mx-auto px-6">
                
                {/* Header */}
                <RevealOnScroll>
                    <div className="text-center mb-12">
                        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl mb-4">
                            Book an Appointment
                        </h1>
                        <div className="divider-gold mx-auto" />
                    </div>
                </RevealOnScroll>

                {/* Progress Steps Indicator */}
                <div className="flex items-center justify-center gap-4 mb-12 select-none">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-4">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${step >= s
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

                {/* Booking Session Cart Summary */}
                {bookingCart.length > 0 && step < 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--color-blush)] border border-[var(--color-gold-muted)] p-5 mb-10 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-sm"
                    >
                        <div className="text-center sm:text-left">
                            <p className="font-[family-name:var(--font-cinzel)] text-[9px] tracking-[0.2em] text-[var(--color-gold-dark)] font-bold mb-1">
                                ACTIVE BOOKING
                            </p>
                            <p className="text-xs text-[var(--color-ink)]">
                                You have <span className="font-semibold">{bookingCart.length} service(s)</span> added to your booking.
                            </p>
                        </div>
                        <button
                            onClick={() => setStep(3)}
                            className="btn-gold !py-2.5 !px-6 text-[9px] tracking-widest whitespace-nowrap"
                        >
                            Proceed to Checkout (₦{getCartTotal().toLocaleString()})
                        </button>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {/* Step 1: Select Service */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            variants={STAGGER}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, x: -15 }}
                        >
                            <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl mb-8 text-center italic text-[var(--color-slate-light)]">
                                Select a service to add
                            </h2>
                            <div className="space-y-4">
                                {services.map((s) => {
                                    // Check if this service is already in cart
                                    const inCart = bookingCart.some(item => item.service.id === s.id);
                                    return (
                                        <motion.button
                                            key={s.id}
                                            variants={FADE_IN_UP}
                                            disabled={inCart}
                                            onClick={() => { setSelectedService(s); setStep(2); }}
                                            className={`w-full text-left p-6 border transition-all duration-500 hover:border-[var(--color-gold)] relative ${inCart
                                                ? "border-[rgba(26,26,26,0.04)] bg-[rgba(26,26,26,0.02)] opacity-50 cursor-not-allowed"
                                                : "border-[rgba(26,26,26,0.08)] bg-white hover:bg-[var(--color-mist)]"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[9px] text-[var(--color-gold)] tracking-[0.2em] uppercase mb-1.5 font-[family-name:var(--font-cinzel)] font-bold">
                                                        {s.category} · {s.duration_minutes} min
                                                    </p>
                                                    <h3 className="font-[family-name:var(--font-playfair)] text-lg text-[var(--color-ink)]">{s.name}</h3>
                                                    <p className="text-xs text-[var(--color-slate)] mt-1 max-w-md line-clamp-1">{s.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-[family-name:var(--font-playfair)] text-lg">₦{s.price.toLocaleString()}</p>
                                                    {inCart && (
                                                        <span className="text-[8px] tracking-wider uppercase font-semibold text-[var(--color-gold-dark)] block mt-1">
                                                            Added
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                                {services.length === 0 && (
                                    <div className="text-center text-[var(--color-slate)] py-8">
                                        Loading services...
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Select Date & Time */}
                    {step === 2 && selectedService && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="text-center mb-8">
                                <p className="text-[10px] tracking-[0.2em] font-[family-name:var(--font-cinzel)] text-[var(--color-gold)] uppercase font-bold mb-1">
                                    Scheduling
                                </p>
                                <h2 className="font-[family-name:var(--font-playfair)] text-2xl">
                                    {selectedService.name}
                                </h2>
                            </div>

                            {/* Date Picker */}
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-10">
                                {dates.map((d) => {
                                    const isSelected = selectedDate?.toDateString() === d.toDateString();
                                    return (
                                        <button
                                            key={d.toISOString()}
                                            onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                                            className={`py-3 text-center transition-all duration-300 rounded-sm flex flex-col justify-center items-center ${isSelected
                                                ? "bg-[var(--color-gold)] text-[var(--color-canvas)]"
                                                : "border border-[rgba(26,26,26,0.08)] bg-white hover:border-[var(--color-gold)] text-[var(--color-ink)]"
                                                }`}
                                        >
                                            <p className="text-[9px] uppercase tracking-wider font-semibold opacity-85">
                                                {d.toLocaleDateString("en", { weekday: "short" })}
                                            </p>
                                            <p className="text-base font-semibold mt-0.5">{d.getDate()}</p>
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
                                    <h3 className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.25em] mb-6 text-center uppercase text-[var(--color-gold-dark)] font-bold">
                                        Select Appointment Slot
                                    </h3>
                                    {loading ? (
                                        <div className="text-center text-sm text-[var(--color-slate)] py-8">Checking availability...</div>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
                                            {availableSlots.map((slot, idx) => {
                                                const timeLabel = formatTime(slot.start_time);
                                                const isSelected = selectedSlot?.start_time === slot.start_time;
                                                return (
                                                    <button
                                                        key={`${slot.start_time}-${idx}`}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`py-3.5 text-xs text-center font-medium rounded-sm transition-all duration-300 ${isSelected
                                                            ? "bg-[var(--color-gold)] text-[var(--color-canvas)]"
                                                            : "border border-[rgba(26,26,26,0.08)] bg-white hover:border-[var(--color-gold)]"
                                                            }`}
                                                    >
                                                        {timeLabel}
                                                        <span className="block text-[8px] opacity-75 mt-0.5 font-normal tracking-wide">
                                                            {slot.staff_name}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center text-sm text-[var(--color-slate)] py-8">
                                            No slots available for this date.
                                        </div>
                                    )}

                                    {selectedSlot && (
                                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
                                            <button
                                                disabled={loading}
                                                onClick={handleAddToCart}
                                                className="btn-outline w-full sm:w-auto px-8 py-3.5"
                                            >
                                                Add & Choose Another
                                            </button>
                                            <button
                                                disabled={loading}
                                                onClick={async () => {
                                                    await handleAddToCart();
                                                    setStep(3);
                                                }}
                                                className="btn-gold w-full sm:w-auto px-8 py-3.5"
                                            >
                                                Proceed to Checkout
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            <button
                                onClick={() => setStep(1)}
                                className="text-[10px] tracking-[0.2em] font-[family-name:var(--font-cinzel)] uppercase text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors block mx-auto mt-6"
                            >
                                ← Back to services
                            </button>
                        </motion.div>
                    )}

                    {/* Step 3: Checkout Session Confirmation */}
                    {step === 3 && (bookingCart.length > 0 || (selectedService && selectedSlot)) && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="font-[family-name:var(--font-playfair)] text-2xl mb-8 text-center">
                                Review Your Booking
                            </h2>

                            {/* Booking List Cards */}
                            <div className="space-y-4 mb-8">
                                {bookingCart.map((item, idx) => (
                                    <div key={idx} className="border border-[rgba(26,26,26,0.08)] bg-white p-6 relative">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[8px] text-[var(--color-gold)] tracking-[0.2em] uppercase mb-1 font-[family-name:var(--font-cinzel)] font-bold">
                                                    {item.service.category} · {item.service.duration_minutes} min
                                                </p>
                                                <h3 className="font-[family-name:var(--font-playfair)] text-base">{item.service.name}</h3>
                                                <p className="text-xs text-[var(--color-slate)] mt-1.5 leading-relaxed">
                                                    Scheduled: <span className="font-semibold text-[var(--color-ink)]">{item.date.toLocaleDateString("en", { month: "short", day: "numeric" })} at {formatTime(item.slot.start_time)}</span> with {item.slot.staff_name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-[family-name:var(--font-playfair)] text-base">₦{item.service.price.toLocaleString()}</p>
                                                <button
                                                    onClick={() => setBookingCart(prev => prev.filter((_, i) => i !== idx))}
                                                    className="text-[9px] text-red-500/80 hover:text-red-500 uppercase tracking-widest mt-4 inline-block font-semibold transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Display active selections if not yet in cart */}
                                {selectedService && selectedSlot && selectedDate && (
                                    <div className="border border-[var(--color-gold-muted)] bg-[var(--color-mist)] p-6 relative">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[8px] text-[var(--color-gold)] tracking-[0.2em] uppercase mb-1 font-[family-name:var(--font-cinzel)] font-bold">
                                                    {selectedService.category} · {selectedService.duration_minutes} min
                                                </p>
                                                <h3 className="font-[family-name:var(--font-playfair)] text-base">{selectedService.name}</h3>
                                                <p className="text-xs text-[var(--color-slate)] mt-1.5">
                                                    Scheduled: <span className="font-semibold">{selectedDate.toLocaleDateString("en", { month: "short", day: "numeric" })} at {formatTime(selectedSlot.start_time)}</span> with {selectedSlot.staff_name}
                                                </p>
                                            </div>
                                            <p className="font-[family-name:var(--font-playfair)] text-base">₦{selectedService.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Summary Totals & Deposit breakdown */}
                            <div className="border border-[rgba(26,26,26,0.08)] bg-white p-8 mb-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--color-slate)] text-sm">Combined Service Value</span>
                                        <span className="text-sm font-medium">₦{getTotalPrice().toLocaleString()}</span>
                                    </div>
                                    
                                    <div className="h-[1px] bg-[rgba(26,26,26,0.06)] my-4" />
                                    
                                    <div className="flex justify-between items-center text-[var(--color-gold-dark)]">
                                        <div>
                                            <span className="text-sm font-semibold block">Secure OPay Deposit (30% Upfront)</span>
                                            <span className="text-[10px] opacity-75">Required now to secure booking</span>
                                        </div>
                                        <span className="font-[family-name:var(--font-playfair)] text-xl font-bold">₦{getDepositTotal().toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-[var(--color-slate)] opacity-85">
                                        <div>
                                            <span className="text-xs block">Outstanding Balance (70%)</span>
                                            <span className="text-[9px] opacity-75">To be settled at the salon</span>
                                        </div>
                                        <span className="text-sm font-medium">₦{getRemainingTotal().toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Secure gateway trust badge */}
                            <div className="bg-[rgba(26,26,26,0.03)] border border-[rgba(26,26,26,0.08)] p-6 mb-8 text-center rounded-sm">
                                <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.1em] text-[var(--color-gold)] mb-2 font-bold">
                                    OPAY EXPRESS SECURE GATEWAY
                                </p>
                                <p className="text-xs text-[var(--color-slate)] leading-relaxed mb-3">
                                    You will be securely redirected to OPay Checkout to process your 30% secure deposit.
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-gold)]">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <span className="text-[9px] tracking-wider uppercase text-[var(--color-slate)] font-semibold">
                                        PCI-DSS Level 1 Compliant · 256-bit SSL
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={loading || (bookingCart.length === 0 && !selectedService)}
                                className="btn-gold w-full justify-center mb-4 disabled:opacity-50 !py-4"
                            >
                                {loading ? "Redirecting to OPay..." : `Secure Slots & Pay Deposit (₦${getDepositTotal().toLocaleString()})`}
                            </button>
                            
                            <button
                                onClick={() => setStep(1)}
                                className="text-[10px] tracking-[0.2em] font-[family-name:var(--font-cinzel)] uppercase text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors block mx-auto mt-4"
                            >
                                ← Add more services
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
