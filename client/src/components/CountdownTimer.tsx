import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

export function CountdownTimer({ uploadTime, className }: { uploadTime: number, className?: string }) {
    const [timeLeft, setTimeLeft] = useState(() => {
        const expiresAt = uploadTime + 60 * 60 * 1000;
        return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const expiresAt = uploadTime + 60 * 60 * 1000;
            const now = Date.now();
            return Math.max(0, Math.floor((expiresAt - now) / 1000));
        };

        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, [uploadTime]);

    if (timeLeft <= 0) {
        return <span className={cn("text-red-500 font-mono text-xs font-bold", className)}>Expired</span>;
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isEnding = timeLeft < 5 * 60; // Less than 5 mins

    return (
        <span className={cn(
            "font-mono text-xs px-2 py-0.5 rounded-md flex items-center gap-1.5 transition-colors border",
            isEnding
                ? "bg-red-50/50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 animate-pulse"
                : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-zinc-800/50 dark:text-gray-400 dark:border-zinc-700",
            className
        )}>
            {isEnding && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
    );
}
