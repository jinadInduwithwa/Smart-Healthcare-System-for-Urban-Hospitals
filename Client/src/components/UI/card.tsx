// Card.tsx
import React from 'react';
import { cn } from '@/lib/utils'; // Utility function for conditional classNames

type CardProps = {
    children: React.ReactNode;
    className?: string;
};

export const Card = ({ children, className }: CardProps) => (
    <div className={cn("border rounded-lg shadow-sm bg-white p-4", className)}>
        {children}
    </div>
);

export const CardContent = ({ children, className }: CardProps) => (
    <div className={cn("p-4", className)}>
        {children}
    </div>
);
