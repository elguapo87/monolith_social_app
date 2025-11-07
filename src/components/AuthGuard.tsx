"use client"

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children } : { children: React.ReactNode }) {
    const { isLoaded, user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !user) {
            router.replace("/");
        }
    }, [isLoaded, user, router]);

    console.log("AuthGuard user:", user);

    if (!isLoaded) {
        return <p>Loading...</p>
    }

    if (!user) {
        return null
    }

    return <>{children}</>
}
