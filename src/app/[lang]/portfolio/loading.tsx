export default function PortfolioLoading() {
    return (
        <div className="min-h-[100dvh] bg-background pt-24 pb-20">
            <div className="container-content">
                {/* Skeleton for Hero */}
                <div className="w-full max-w-3xl mx-auto text-center mb-12 animate-pulse space-y-4">
                    <div className="h-10 bg-muted rounded-lg w-2/3 mx-auto"></div>
                    <div className="h-6 bg-muted rounded-lg w-1/2 mx-auto"></div>
                </div>

                {/* Skeleton for Filter Tabs */}
                <div className="flex justify-center gap-2 mb-8 animate-pulse">
                    <div className="w-20 h-8 bg-muted rounded-full"></div>
                    <div className="w-24 h-8 bg-muted rounded-full"></div>
                    <div className="w-16 h-8 bg-muted rounded-full"></div>
                    <div className="w-24 h-8 bg-muted rounded-full"></div>
                </div>

                {/* Skeleton for Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-card rounded-2xl shadow-sm border border-border p-4 space-y-4">
                            <div className="h-48 bg-muted rounded-xl w-full"></div>
                            <div className="h-6 bg-muted rounded-lg w-3/4"></div>
                            <div className="h-4 bg-muted rounded-lg w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
