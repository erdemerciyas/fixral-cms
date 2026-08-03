'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body>
        {/* global-error kök layout'u değiştirdiği için CSS token'ları yüklenmez;
            Precision Dark paletinin sabit hex değerleri kullanılır (public-dark scope). */}
        <div className="min-h-screen bg-linear-to-br from-[#14171B] via-[#0B0D10] to-[#0B0D10] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#FA6831] to-[#C24E1E]">
                Hata
              </h1>
              <h2 className="text-2xl font-bold text-[#E5E9EC] mt-4">
                Bir şeyler ters gitti
              </h2>
              <p className="text-[#9BA3AB] mt-4 text-lg">
                Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={reset}
                className="inline-block px-8 py-3 bg-linear-to-r from-[#EB6F40] to-[#C24E1E] text-[#1C1C1C] font-medium rounded-lg hover:from-[#FA6831] hover:to-[#EB6F40] transition-all duration-200 transform hover:scale-105"
              >
                Tekrar Dene
              </button>
              
              <div className="mt-6">
                {/* global-error kök layout'u değiştirdiği için next/link yerine
                    düz <a> kullanılır (rule bilerek devre dışı) */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/"
                  className="text-[#FC895F] hover:text-[#FDA686] transition-colors duration-200"
                >
                  Ana Sayfaya Dön
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 