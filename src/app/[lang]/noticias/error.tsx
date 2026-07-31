'use client';

export default function NoticiasError({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="min-h-[100dvh] bg-background flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/15 text-destructive mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-3">Se produjo un error</h1>
                <p className="text-muted-foreground mb-8">Hubo un problema al cargar la página. Por favor, inténtelo de nuevo.</p>
                <button
                    onClick={reset}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    Intentar de nuevo
                </button>
            </div>
        </div>
    );
}
