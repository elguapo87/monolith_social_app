"use client"

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "./Loading";

export default function GuestGuard({ children } : { children: React.ReactNode }) {
    const router = useRouter();
    const { isLoaded, user } = useUser();

    useEffect(() => {
        if (isLoaded && user) {
            router.replace("/auth");
        }
    }, [user, isLoaded, router]);

    if (!isLoaded) {
        return <Loading />
    }

    if (user) {
        return null;
    }

    return <>{children}</>
}