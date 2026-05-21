"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("joyshidden_token");
        const publicPaths = ["/auth/login", "/auth/register"];

        // If no token exists and they are not on a public path, cleanly redirect.
        if (!token && !publicPaths.includes(pathname)) {
            router.replace("/auth/login");
        } else {
            setIsAuthorized(true);
        }
    }, [pathname, router]);

    if (!isAuthorized) {
        // Render a sleek, brand-aligned splash screen while verifying to prevent content UI "flash"
        return (
            <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center z-[9999]">
                <div className="font-cinzel text-[#D4AF37] text-lg tracking-[0.3em] uppercase animate-pulse">
                    Joy&apos;s Hidden Beauty
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
