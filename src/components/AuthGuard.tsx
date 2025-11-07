"use client"

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "./Loading";

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
        return <Loading />
    }

    if (!user) {
        return null
    }

    return <>{children}</>
}
