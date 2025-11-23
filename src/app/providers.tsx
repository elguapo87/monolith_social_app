"use client"

import { store } from "@/redux/store";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";

export default function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider>
            <Provider store={store}>
                <Toaster />
                {children}
            </Provider>
        </ClerkProvider>
    );
}