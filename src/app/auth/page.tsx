"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const { isAuthenticated, setShowAuthFlow } = useDynamicContext();
    const router = useRouter();
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    // If the user closes the modal without connecting, we might want to show the button again.
    // However, detecting "modal close" from here is tricky without the explicit event.
    // A simple timeout or relying on the user to refresh if they cancel is a safer MVP, 
    // OR we can just leave it hidden since they likely wanted to connect.
    // BETTER: We can use a layout effect or just assume if they are not authenticated after a while, 
    // we *could* reset. But for now, let's hide it on click.

    const handleConnect = () => {
        if (isAuthenticated) {
            router.push("/dashboard");
            return;
        }

        setIsConnecting(true);
        setShowAuthFlow(true);
    };

    // Effect to reset button state if modal closes without auth
    // This is a heuristic: if we clicked connect, but time passed and we are still not authenticated,
    // and the modal might have been closed by the user.
    // Dynamic SDK doesn't provide a simple "onClose" hook here easily without custom events.
    // A simple way is to add a "Cancel" or "Reset" button if it gets stuck, or rely on the user reloading.
    // For now, we will add a small "Log out / Reset" text below for stuck users.

    const handleLogout = async () => {
        try {
            await window.localStorage.clear();
            window.location.reload();
        } catch (e) {
            console.error("Error clearing storage", e);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center relative">
            {/* Brand at the Top Left */}
            <div className="absolute top-8 left-8 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/5">
                        <span className="font-bold text-xl text-white">K</span>
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">KINICH</span>
                </div>
            </div>

            {/* Centered Connect Button - Only visible when not connecting */}
            <div className={`relative z-10 flex flex-col items-center gap-4 transition-opacity duration-300 ${isConnecting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button
                    onClick={handleConnect}
                    className="group px-8 py-4 bg-white text-black text-lg font-medium rounded-full hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 cursor-pointer"
                >
                    Connect Wallet
                </button>

                <button
                    onClick={handleLogout}
                    className="text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                    Reset Session
                </button>
            </div>
        </div>
    );
}

