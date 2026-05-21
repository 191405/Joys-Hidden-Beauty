"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { apiFetch, getToken, clearToken } from "@/lib/api";
import Logo from "@/components/brand/Logo";

interface UserProfile {
    id: number;
    first_name: string;
    email: string;
    skin_profile: {
        type: string | null;
        tone: string | null;
        allergies: string[];
        concerns: string[];
    };
}

export default function AccountClient() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"profile" | "appointments" | "beauty">("profile");
    const router = useRouter();

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/auth/login");
            return;
        }

        async function loadProfile() {
            try {
                const data = await apiFetch<UserProfile>("/user/profile");
                setUser(data);
            } catch {
                // Token might be invalid
                clearToken();
                router.push("/auth/login");
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [router]);

    const handleLogout = () => {
        clearToken();
        router.push("/");
    };

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

    if (!user) return null;

    return (
        <div className="pt-32 pb-20 min-h-screen">
            <div className="max-w-[900px] mx-auto px-6">
                {/* Header */}
                <RevealOnScroll>
                    <div className="text-center mb-16 flex flex-col items-center justify-center">
                        <Logo variant="emblem" size="default" theme="gold" className="mb-4" />
                        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.3em] uppercase text-[var(--color-gold)] mb-4">
                            My Account
                        </p>
                        <h1 className="font-[family-name:var(--font-playfair)] text-4xl mb-2">
                            Welcome, {user.first_name}
                        </h1>
                        <div className="divider-gold mx-auto" />
                    </div>
                </RevealOnScroll>

                {/* Tabs */}
                <div className="flex justify-center gap-8 mb-12">
                    {(["profile", "appointments", "beauty"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-xs tracking-[0.15em] uppercase pb-1 border-b transition-all ${activeTab === tab
                                ? "text-[var(--color-ink)] border-[var(--color-gold)]"
                                : "text-[var(--color-slate)] border-transparent hover:text-[var(--color-ink)]"
                                }`}
                        >
                            {tab === "beauty" ? "Beauty Profile" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto"
                    >
                        <div className="space-y-6">
                            <div className="border border-[rgba(26,26,26,0.08)] p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] uppercase">
                                        Account Details
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-[var(--color-slate)] mb-1">Name</p>
                                        <p className="text-sm">{user.first_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--color-slate)] mb-1">Email</p>
                                        <p className="text-sm">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="btn-outline w-full justify-center text-xs"
                            >
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Appointments Tab */}
                {activeTab === "appointments" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto text-center"
                    >
                        <div className="py-16">
                            <p className="text-[var(--color-slate)] mb-6">No upcoming appointments</p>
                            <Link href="/booking" className="btn-gold text-xs">
                                Book a Service
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* Beauty Profile Tab */}
                {activeTab === "beauty" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto"
                    >
                        <div className="border border-[rgba(26,26,26,0.08)] p-6 mb-6">
                            <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] uppercase mb-6">
                                Your Beauty Profile
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-xs text-[var(--color-slate)]">Skin Type</span>
                                    <span className="text-sm">{user.skin_profile.type || "Not set"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-[var(--color-slate)]">Skin Tone</span>
                                    <div className="flex items-center gap-2">
                                        {user.skin_profile.tone && (
                                            <div
                                                className="w-5 h-5 rounded-full border"
                                                style={{ backgroundColor: user.skin_profile.tone }}
                                            />
                                        )}
                                        <span className="text-sm">{user.skin_profile.tone || "Not set"}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-[var(--color-slate)]">Allergies</span>
                                    <span className="text-sm">
                                        {user.skin_profile.allergies.length > 0
                                            ? user.skin_profile.allergies.join(", ")
                                            : "None"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-[var(--color-slate)]">Concerns</span>
                                    <span className="text-sm">
                                        {user.skin_profile.concerns.length > 0
                                            ? user.skin_profile.concerns.join(", ")
                                            : "Not set"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-center text-[var(--color-slate)]">
                            Complete your beauty profile to receive personalized product recommendations.
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
