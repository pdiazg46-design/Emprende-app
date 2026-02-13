import { ReactNode } from "react";
import { DesktopSidebar } from "./DesktopSidebar";

interface DesktopLayoutProps {
    children: ReactNode;
    user: any;
}

export function DesktopLayout({ children, user }: DesktopLayoutProps) {
    return (
        <div className="min-h-screen bg-[#F4F7F9] flex">
            <DesktopSidebar user={user} />
            <main className="flex-1 md:ml-64 p-8 transition-all duration-300">
                {children}
            </main>
        </div>
    );
}
