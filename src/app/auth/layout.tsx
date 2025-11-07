import AuthGuard from "@/components/AuthGuard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <div className="relative w-full h-screen flex">
                {children}
            </div>
        </AuthGuard>
    )
}