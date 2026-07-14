"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/** Routes that require authentication — everything else is public */
const PROTECTED_PREFIXES = ["/account", "/admin"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

        if (!isProtected) {
            // Public page — no auth needed
            setIsAuthorized(true);
            return;
        }

        const token = localStorage.getItem("joyshidden_token");
        if (!token) {
            router.replace("/auth/login");
        } else {
            setIsAuthorized(true);
        }
    }, [pathname, router]);

    if (!isAuthorized) {
        return (
            <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center z-[9999]">
                <div className="font-[family-name:var(--font-cinzel)] text-[#D4AF37] text-lg tracking-[0.3em] uppercase animate-pulse">
                    Joy&apos;s Hidden Beauty
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
