"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { apiFetch, getToken, clearToken } from "@/lib/api";
import { formatTime, formatDate } from "@/lib/formatters";
import Logo from "@/components/brand/Logo";

interface UserProfile {
    id: number;
    first_name: string;
    email: string;
    phone: string;
    skin_profile: {
        type: string | null;
        tone: string | null;
        allergies: string[];
        concerns: string[];
    };
}

interface Appointment {
    id: number;
    service: string;
    staff: string;
    start_time: string;
    end_time: string;
    status: string;
    notes: string;
}

interface RecommendedProduct {
    id: number;
    name: string;
    slug: string;
    category: string;
    price: number;
    description: string;
    image_url: string;
    match_score: number;
}

const AVAILABLE_SKIN_TYPES = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];
const AVAILABLE_CONCERNS = ["Hydration", "Anti-aging", "Acne", "Redness", "Hyperpigmentation", "Brightening", "Pores"];
const AVAILABLE_ALLERGIES = ["Fragrance", "Parabens", "Sulfates", "Niacinamide", "Retinol", "Salicylic Acid", "Gluten"];

const TABS = [
    { id: "profile" as const, label: "My Profile" },
    { id: "appointments" as const, label: "My Bookings" },
    { id: "skin" as const, label: "Skin Consultation" },
    { id: "recs" as const, label: "Matches" },
];

export default function AccountClient() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "appointments" | "skin" | "recs">("profile");
    
    // Interactive Edit State
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editType, setEditType] = useState<string | null>(null);
    const [editTone, setEditTone] = useState("");
    const [editAllergies, setEditAllergies] = useState<string[]>([]);
    const [editConcerns, setEditConcerns] = useState<string[]>([]);

    const router = useRouter();

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/auth/login");
            return;
        }

        async function loadDashboardData() {
            try {
                // 1. Fetch Profile
                const profileData = await apiFetch<UserProfile>("/user/profile");
                setUser(profileData);
                setEditName(profileData.first_name);
                setEditPhone(profileData.phone || "");
                setEditType(profileData.skin_profile.type);
                setEditTone(profileData.skin_profile.tone || "#D4AF37");
                setEditAllergies(profileData.skin_profile.allergies);
                setEditConcerns(profileData.skin_profile.concerns);

                // 2. Fetch Appointments
                const aptsData = await apiFetch<Appointment[]>("/booking/my-appointments");
                setAppointments(aptsData);

                // 3. Fetch Recommendations
                const recsData = await apiFetch<RecommendedProduct[]>("/user/recommendations");
                setRecommendations(recsData);

            } catch (err) {
                console.error("Dashboard fetch error:", err);
                clearToken();
                router.push("/auth/login");
            } finally {
                setLoading(false);
            }
        }
        loadDashboardData();
    }, [router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const payload = {
                first_name: editName,
                phone: editPhone,
                skin_type: editType,
                skin_tone: editTone,
                allergies: editAllergies.join(","),
                concerns: editConcerns.join(",")
            };

            const updatedData = await apiFetch<UserProfile>("/user/profile", {
                method: "PUT",
                body: JSON.stringify(payload)
            });

            setUser(updatedData);

            // Refetch recommendations since skin profile changed
            const recsData = await apiFetch<RecommendedProduct[]>("/user/recommendations");
            setRecommendations(recsData);
            
            alert("Profile updated successfully.");
        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update profile.");
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleAllergy = (allergy: string) => {
        setEditAllergies(prev => 
            prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
        );
    };

    const handleToggleConcern = (concern: string) => {
        setEditConcerns(prev => 
            prev.includes(concern) ? prev.filter(c => c !== concern) : [...prev, concern]
        );
    };

    const handleLogout = () => {
        clearToken();
        router.push("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-40 flex items-start justify-center bg-[var(--color-canvas)]">
                <div className="animate-pulse text-center">
                    <div className="h-12 w-12 rounded-full border-t border-[var(--color-gold)] animate-spin mx-auto mb-6" />
                    <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.3em] uppercase text-[var(--color-gold-dark)]">
                        Loading Dashboard
                    </p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="pt-32 pb-20 min-h-screen bg-[var(--color-canvas)]">
            <div className="max-w-[1000px] mx-auto px-6">
                
                {/* Header */}
                <RevealOnScroll>
                    <div className="text-center mb-16 flex flex-col items-center justify-center">
                        <Logo variant="emblem" size="default" theme="gold" className="mb-4 animate-pulse" />
                        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.3em] uppercase text-[var(--color-gold)] mb-4">
                            Client Portal
                        </p>
                        <h1 className="font-[family-name:var(--font-playfair)] text-4xl mb-3">
                            Welcome Back, {user.first_name}
                        </h1>
                        <div className="divider-gold mx-auto" />
                    </div>
                </RevealOnScroll>

                {/* Grid layout tabs */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-12 border-b border-[rgba(26,26,26,0.06)] pb-4 select-none">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`text-[10px] sm:text-xs tracking-[0.2em] uppercase pb-2 border-b-2 transition-all font-semibold duration-300 ${activeTab === tab.id
                                ? "text-[var(--color-ink)] border-[var(--color-gold)]"
                                : "text-[var(--color-slate)] border-transparent hover:text-[var(--color-ink)]"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Tab 1: Profile */}
                    {activeTab === "profile" && (
                        <motion.div
                            key="profile-tab"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4 }}
                            className="max-w-md mx-auto"
                        >
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="border border-[rgba(26,26,26,0.08)] bg-white p-8 space-y-5">
                                    <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-[var(--color-gold-dark)] uppercase font-bold mb-4">
                                        Client Info
                                    </h3>
                                    
                                    <div>
                                        <label className="text-[9px] tracking-widest uppercase font-semibold text-[var(--color-slate)] block mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="input-luxury rounded-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] tracking-widest uppercase font-semibold text-[var(--color-slate)] block mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            className="input-luxury rounded-sm"
                                            placeholder="+234..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] tracking-widest uppercase font-semibold text-[var(--color-slate)] block mb-1">
                                            Email Address (Read-Only)
                                        </label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            disabled
                                            className="input-luxury rounded-sm opacity-60 bg-[rgba(26,26,26,0.02)] cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="btn-gold w-full py-3.5"
                                >
                                    {updating ? "Saving Details..." : "Save Details"}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="btn-outline w-full py-3.5"
                                >
                                    Sign Out
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* Tab 2: Bookings */}
                    {activeTab === "appointments" && (
                        <motion.div
                            key="apts-tab"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4 }}
                            className="max-w-[700px] mx-auto"
                        >
                            {appointments.length > 0 ? (
                                <div className="space-y-4">
                                    {appointments.map((apt) => {
                                        // Dynamic deposit display (standard 30% upfront on total slot)
                                        // In standard JHB services, total price is derived from catalog service
                                        return (
                                            <div key={apt.id} className="border border-[rgba(26,26,26,0.08)] bg-white p-6 rounded-sm">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                    <div>
                                                        <span className={`text-[8px] tracking-[0.2em] uppercase font-bold px-2.5 py-1 rounded-full ${
                                                            apt.status === "confirmed" 
                                                                ? "bg-green-50 text-green-700 border border-green-200" 
                                                                : apt.status === "held" 
                                                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                                : "bg-gray-50 text-gray-700 border border-gray-200"
                                                        }`}>
                                                            {apt.status}
                                                        </span>
                                                        <h3 className="font-[family-name:var(--font-playfair)] text-xl mt-3 mb-1">
                                                            {apt.service}
                                                        </h3>
                                                        <p className="text-xs text-[var(--color-slate)] leading-relaxed">
                                                            Date: <span className="font-semibold text-[var(--color-ink)]">{formatDate(apt.start_time)} at {formatTime(apt.start_time)}</span>
                                                        </p>
                                                        <p className="text-xs text-[var(--color-slate)] mt-0.5">
                                                            Practitioner: <span className="font-semibold">{apt.staff}</span>
                                                        </p>
                                                    </div>
                                                    
                                                    {apt.status === "confirmed" && (
                                                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto">
                                                            <p className="text-[10px] text-green-700 uppercase tracking-widest font-semibold flex items-center gap-1.5 sm:justify-end">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                                30% Deposit Paid
                                                            </p>
                                                            <p className="text-xs text-[var(--color-slate)] mt-1.5">
                                                                Outstanding Balance: <span className="font-bold text-[var(--color-ink)]">70% Due at Salon</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <p className="text-[var(--color-slate)] mb-8">No scheduled appointments</p>
                                    <Link href="/booking" className="btn-gold text-xs">
                                        Schedule an Appointment
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Tab 3: Skin Consultation */}
                    {activeTab === "skin" && (
                        <motion.div
                            key="skin-tab"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4 }}
                            className="max-w-[650px] mx-auto"
                        >
                            <form onSubmit={handleUpdateProfile} className="space-y-8">
                                <div className="border border-[rgba(26,26,26,0.08)] bg-white p-8 space-y-8">
                                    
                                    {/* 1. Skin Type Select */}
                                    <div>
                                        <h3 className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.2em] uppercase text-[var(--color-gold-dark)] font-bold mb-4">
                                            1. Skin Profile Type
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                            {AVAILABLE_SKIN_TYPES.map((type) => (
                                                <button
                                                    type="button"
                                                    key={type}
                                                    onClick={() => setEditType(type)}
                                                    className={`py-3 text-xs border rounded-sm font-medium transition-all duration-300 ${
                                                        editType === type 
                                                            ? "bg-[var(--color-gold)] text-[var(--color-canvas)] border-[var(--color-gold)]"
                                                            : "border-[rgba(26,26,26,0.08)] hover:border-[var(--color-gold)]"
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Skin Tone Hex Picker */}
                                    <div>
                                        <h3 className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.2em] uppercase text-[var(--color-gold-dark)] font-bold mb-4">
                                            2. Skin Tone / Foundation Baseline
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                value={editTone}
                                                onChange={(e) => setEditTone(e.target.value)}
                                                className="w-12 h-12 rounded-full border border-gray-200 cursor-pointer overflow-hidden flex-shrink-0"
                                            />
                                            <div>
                                                <span className="text-xs text-[var(--color-slate)] block">Hex Color Baseline</span>
                                                <span className="text-sm font-semibold uppercase tracking-wider">{editTone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Skin Concerns Tag Selector */}
                                    <div>
                                        <h3 className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.2em] uppercase text-[var(--color-gold-dark)] font-bold mb-4">
                                            3. Skin Concerns & Focus Areas
                                        </h3>
                                        <div className="flex flex-wrap gap-2.5">
                                            {AVAILABLE_CONCERNS.map((concern) => {
                                                const selected = editConcerns.includes(concern);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={concern}
                                                        onClick={() => handleToggleConcern(concern)}
                                                        className={`px-4 py-2.5 text-xs rounded-full border font-medium transition-all duration-300 ${
                                                            selected
                                                                ? "bg-[var(--color-gold)] text-[var(--color-canvas)] border-[var(--color-gold)]"
                                                                : "border-[rgba(26,26,26,0.08)] bg-white text-[var(--color-slate)] hover:border-[var(--color-gold)] hover:text-[var(--color-ink)]"
                                                        }`}
                                                    >
                                                        {concern}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 4. Skin Allergies Selector */}
                                    <div>
                                        <h3 className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.2em] uppercase text-[var(--color-gold-dark)] font-bold mb-4">
                                            4. Avoid Ingredients / Allergies
                                        </h3>
                                        <div className="flex flex-wrap gap-2.5">
                                            {AVAILABLE_ALLERGIES.map((allergy) => {
                                                const selected = editAllergies.includes(allergy);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={allergy}
                                                        onClick={() => handleToggleAllergy(allergy)}
                                                        className={`px-4 py-2.5 text-xs rounded-full border font-medium transition-all duration-300 ${
                                                            selected
                                                                ? "bg-[var(--color-gold)] text-[var(--color-canvas)] border-[var(--color-gold)]"
                                                                : "border-[rgba(26,26,26,0.08)] bg-white text-[var(--color-slate)] hover:border-[var(--color-gold)] hover:text-[var(--color-ink)]"
                                                        }`}
                                                    >
                                                        {allergy}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                </div>

                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="btn-gold w-full py-4 text-xs tracking-widest uppercase font-bold"
                                >
                                    {updating ? "Saving Skin Profile..." : "Update Skin Profile"}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* Tab 4: Recommendations */}
                    {activeTab === "recs" && (
                        <motion.div
                            key="recs-tab"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4 }}
                            className="max-w-[900px] mx-auto"
                        >
                            <div className="text-center mb-10">
                                <p className="text-[10px] tracking-[0.2em] font-[family-name:var(--font-cinzel)] text-[var(--color-gold)] uppercase font-bold mb-2">
                                    PERSONALIZED MATCHES
                                </p>
                                <h2 className="font-[family-name:var(--font-playfair)] text-2xl italic text-[var(--color-slate-light)]">
                                    Recommendations matching your skin profile
                                </h2>
                            </div>

                            {recommendations.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                    {recommendations.map((prod) => (
                                        <div key={prod.id} className="border border-[rgba(26,26,26,0.08)] bg-white hover:border-[var(--color-gold)] transition-all duration-500 flex flex-col justify-between">
                                            
                                            {/* Product Image */}
                                            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-mist)] flex-shrink-0">
                                                <div 
                                                    className="absolute inset-0 bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${prod.image_url})` }}
                                                />
                                                <div className="absolute top-4 left-4 bg-[var(--color-gold)] text-[var(--color-canvas)] text-[8px] font-bold tracking-widest uppercase px-3 py-1.5 shadow-sm">
                                                    Match: {prod.match_score}%
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="p-6 flex-1 flex flex-col justify-between mt-auto">
                                                <div>
                                                    <p className="text-[8px] text-[var(--color-gold)] tracking-[0.2em] uppercase mb-1 font-[family-name:var(--font-cinzel)] font-bold">
                                                        {prod.category}
                                                    </p>
                                                    <h3 className="font-[family-name:var(--font-playfair)] text-base font-medium mb-2 leading-snug">
                                                        {prod.name}
                                                    </h3>
                                                    <p className="text-xs text-[var(--color-slate)] line-clamp-3 leading-relaxed mb-4">
                                                        {prod.description}
                                                    </p>
                                                </div>
                                                
                                                {/* Price & CTA */}
                                                <div className="flex justify-between items-center border-t border-[rgba(26,26,26,0.06)] pt-4 mt-auto">
                                                    <span className="font-[family-name:var(--font-playfair)] font-semibold text-base">
                                                        ₦{prod.price > 0 ? prod.price.toLocaleString() : "TBD"}
                                                    </span>
                                                    <span className="text-[9px] tracking-widest uppercase text-[var(--color-gold-dark)] font-bold font-[family-name:var(--font-cinzel)]">
                                                        Coming Soon
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white border border-[rgba(26,26,26,0.08)] p-10">
                                    <p className="text-[var(--color-slate)] text-sm mb-4 leading-relaxed max-w-sm mx-auto">
                                        Please complete your Skin Consultation profile to activate our matching recommendations.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab("skin")}
                                        className="btn-outline text-xs tracking-wider"
                                    >
                                        Start Skin Consultation
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
