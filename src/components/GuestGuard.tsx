"use client"

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GuestGuard({ children } : { children: React.ReactNode }) {
    const router = useRouter();
    const { isLoaded, user } = useUser();

    useEffect(() => {
        if (isLoaded && user) {
            router.replace("/auth");
        }
    }, [user, isLoaded, router]);

    if (!isLoaded) {
        return <p>Loading...</p>
    }

    if (user) {
        return null;
    }

    return <>{children}</>
}