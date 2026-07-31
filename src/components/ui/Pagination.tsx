import Link from 'next/link';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    createPageUrl: (page: number) => string;
}

export default function Pagination({ currentPage, totalPages, createPageUrl }: PaginationProps) {
    if (totalPages <= 1) return null;

    // Logic to determine which page numbers to show
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show on each side of current page
        const range: number[] = [];
        const rangeWithDots: Array<number | string> = [];

        for (let i = 1; i <= totalPages; i++) {
            // Show first, last, current, and neighbors
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        let l: number | null = null;
        for (const i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex justify-center items-center gap-2 select-none">
            {/* Previous Button */}
            {currentPage > 1 ? (
                <Link
                    href={createPageUrl(currentPage - 1)}
                    className="p-2 rounded-lg border border-border bg-transparent text-muted-foreground transition-colors duration-200 ease-out hover:bg-accent hover:text-accent-foreground"
                    aria-label="Önceki Sayfa"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </Link>
            ) : (
                <span className="p-2 rounded-lg border border-border bg-muted text-muted-foreground/50 cursor-not-allowed">
                    <ChevronLeftIcon className="w-5 h-5" />
                </span>
            )}

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {pages.map((p, index) => {
                    if (p === '...') {
                        return (
                            <span key={`dots-${index}`} className="px-2 text-muted-foreground">
                                ...
                            </span>
                        );
                    }

                    const pageNum = Number(p);
                    const isActive = pageNum === currentPage;

                    return (
                        <Link
                            key={pageNum}
                            href={createPageUrl(pageNum)}
                            className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors duration-200 ease-out
                ${isActive
                                    ? 'bg-secondary text-foreground border-border'
                                    : 'bg-transparent text-muted-foreground border-transparent hover:bg-accent hover:text-accent-foreground'
                                }`}
                        >
                            {pageNum}
                        </Link>
                    );
                })}
            </div>

            {/* Next Button */}
            {currentPage < totalPages ? (
                <Link
                    href={createPageUrl(currentPage + 1)}
                    className="p-2 rounded-lg border border-border bg-transparent text-muted-foreground transition-colors duration-200 ease-out hover:bg-accent hover:text-accent-foreground"
                    aria-label="Sonraki Sayfa"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </Link>
            ) : (
                <span className="p-2 rounded-lg border border-border bg-muted text-muted-foreground/50 cursor-not-allowed">
                    <ChevronRightIcon className="w-5 h-5" />
                </span>
            )}
        </div>
    );
}
