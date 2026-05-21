"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface PaymentStatus {
    reference: string;
    status: string;
    amount: number | null;
    message: string;
}

function PaymentReturnContent() {
    const searchParams = useSearchParams();
    const reference = searchParams.get("reference");
    const [status, setStatus] = useState<PaymentStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!reference) {
            setError("No payment reference found.");
            setLoading(false);
            return;
        }

        const verify = async () => {
            try {
                const data = await apiFetch<PaymentStatus>(`/payment/verify/${reference}`);
                setStatus(data);
            } catch {
                setError("Could not verify payment status. Please contact support.");
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [reference]);

    const isSuccess = status?.status === "SUCCESS";
    const isPending = status?.status === "PENDING" || status?.status === "INITIAL";

    return (
        <div className="pt-32 pb-20 min-h-screen">
            <div className="max-w-[600px] mx-auto px-6">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-pulse">
                            <div className="w-16 h-16 rounded-full bg-[var(--color-mist)] mx-auto mb-6" />
                            <div className="h-6 w-48 bg-[var(--color-mist)] mx-auto mb-3" />
                            <div className="h-4 w-32 bg-[var(--color-mist)] mx-auto" />
                        </div>
                        <p className="text-[var(--color-slate)] mt-6 text-sm">Verifying your payment...</p>
                    </div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl mb-4">Something Went Wrong</h2>
                        <p className="text-[var(--color-slate)] mb-6">{error}</p>
                        <a href="/booking" className="btn-gold inline-block px-8 py-3">Try Again</a>
                    </motion.div>
                ) : isSuccess ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="text-center py-20"
                    >
                        <div className="w-16 h-16 rounded-full bg-[var(--color-gold)] flex items-center justify-center mx-auto mb-6">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFCF9" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h2 className="font-[family-name:var(--font-playfair)] text-3xl mb-4">
                            Payment Confirmed
                        </h2>
                        <p className="text-[var(--color-slate)] mb-2">
                            Your appointment has been booked and confirmed.
                        </p>
                        {status.amount && (
                            <p className="text-[var(--color-slate)] text-sm mb-6">
                                Amount paid: <strong>₦{status.amount.toLocaleString()}</strong>
                            </p>
                        )}
                        <p className="text-xs text-[var(--color-gold)] italic mb-8">
                            We await your arrival. Please arrive 10 minutes early.
                        </p>
                        <div className="space-y-3">
                            <a href="/account" className="btn-gold inline-block px-8 py-3">View My Bookings</a>
                            <br />
                            <a href="/booking" className="text-xs text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors">
                                Book another appointment →
                            </a>
                        </div>
                    </motion.div>
                ) : isPending ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl mb-4">Payment Processing</h2>
                        <p className="text-[var(--color-slate)] mb-6">
                            Your payment is still being processed. You&apos;ll receive a confirmation email once it&apos;s complete.
                        </p>
                        <p className="text-xs text-[var(--color-slate)] mb-8">
                            Reference: <span className="font-mono">{reference}</span>
                        </p>
                        <a href="/account" className="btn-gold inline-block px-8 py-3">Go to My Account</a>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl mb-4">
                            Payment {status?.status === "CLOSE" ? "Cancelled" : "Failed"}
                        </h2>
                        <p className="text-[var(--color-slate)] mb-6">{status?.message}</p>
                        <a href="/booking" className="btn-gold inline-block px-8 py-3">Try Again</a>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default function PaymentReturnPage() {
    return (
        <Suspense
            fallback={
                <div className="pt-32 pb-20 min-h-screen">
                    <div className="max-w-[600px] mx-auto px-6 text-center py-20">
                        <div className="animate-pulse">
                            <div className="w-16 h-16 rounded-full bg-[var(--color-mist)] mx-auto mb-6" />
                            <div className="h-6 w-48 bg-[var(--color-mist)] mx-auto mb-3" />
                            <div className="h-4 w-32 bg-[var(--color-mist)] mx-auto" />
                        </div>
                        <p className="text-[var(--color-slate)] mt-6 text-sm">Loading...</p>
                    </div>
                </div>
            }
        >
            <PaymentReturnContent />
        </Suspense>
    );
}
