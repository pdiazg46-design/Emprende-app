import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth()

    if (!session?.user) {
        redirect("/signin")
    }

    if (session.user.role !== "ADMIN") {
        redirect("/emprende")
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {children}
        </div>
    )
}
