/**
 * API utility — wraps fetch with base URL and JWT headers.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function apiFetch<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("joyshidden_token") : null;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(error.detail || `API error: ${res.status}`);
    }

    return res.json();
}

export function setToken(token: string) {
    localStorage.setItem("joyshidden_token", token);
}

export function clearToken() {
    localStorage.removeItem("joyshidden_token");
}

export function getToken(): string | null {
    return typeof window !== "undefined" ? localStorage.getItem("joyshidden_token") : null;
}
