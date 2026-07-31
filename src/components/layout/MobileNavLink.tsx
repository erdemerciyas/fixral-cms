'use client';

import { m } from 'framer-motion';
import PrefetchLink from '../PrefetchLink';

interface MobileNavLinkProps {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    isExternal?: boolean;
    index: number;
    onClick: () => void;
}

export default function MobileNavLink({
    href,
    label,
    icon: Icon,
    isActive,
    isExternal,
    index,
    onClick,
}: MobileNavLinkProps) {
    const classes = `
        flex items-center gap-4
        px-5 py-3.5
        rounded-xs
        text-base font-medium tracking-wide
        transition-all duration-200
        focus-visible:outline-hidden
        focus-visible:ring-2
        focus-visible:ring-ring
        focus-visible:ring-offset-2
        focus-visible:ring-offset-background
        ${isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-primary hover:bg-accent'
        }
    `;

    const content = (
        <>
            <span className={`flex items-center justify-center w-9 h-9 rounded-xs ${isActive ? 'bg-primary/15' : 'bg-muted'} transition-colors duration-200`}>
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
            </span>
            <span className="flex-1">{label}</span>
            {/* Monospace nav meta — zero-padded index (precision kit dili) */}
            <span
                aria-hidden="true"
                className={`font-mono text-[10px] tabular-nums tracking-tight ${isActive ? 'text-primary/80' : 'text-muted-foreground/60'}`}
            >
                {String(index + 1).padStart(2, '0')}
            </span>
        </>
    );

    return (
        <m.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.04, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {isExternal ? (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClick}
                    className={classes}
                    aria-current={isActive ? 'page' : undefined}
                >
                    {content}
                </a>
            ) : (
                <PrefetchLink
                    href={href}
                    onClick={onClick}
                    className={classes}
                    aria-current={isActive ? 'page' : undefined}
                >
                    {content}
                </PrefetchLink>
            )}
        </m.div>
    );
}
