"use client";

interface DemoHeaderBadgeProps {
    isTrial: boolean;
    daysRemaining: number;
}

export function DemoHeaderBadge({ isTrial, daysRemaining }: DemoHeaderBadgeProps) {
    if (!isTrial) return null;

    const isUrgent = daysRemaining <= 5;

    return (
        <a 
            href="https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=4cb1a5c9597d4bea924afdc82a1ef778"
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-1 -ml-1 text-[10px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-md flex items-center justify-center gap-1 w-max transition-all shadow-sm ${
                isUrgent 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'
            }`}
        >
            DEMO: {daysRemaining} DÍAS
        </a>
    );
}
