'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useLocale } from '@/hooks/useLocale';
import AuthTemplate from '@/templates/AuthTemplate';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = useLocale();
    const callbackUrl = searchParams?.get('callbackUrl') || `/${lang}`;

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            } else {
                toast.success('Giriş başarılı!');
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error) {
            toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthTemplate title="Giriş Yap" description="Hesabınıza giriş yapın.">
            <div className="bg-card p-8 border border-border shadow-[var(--shadow-sm)]">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">E-posta</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xs border border-input bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none"
                                placeholder="ornek@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Şifre</label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xs border border-input bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-end">
                            <Link href={`/${lang}/contact`} className="text-sm text-accent-foreground hover:underline">
                                Şifremi Unuttum
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xs hover:bg-primary/90 transition-colors duration-150 motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
                        Hesabınız yok mu? <Link href={`/${lang}/register`} className="text-accent-foreground font-bold hover:underline">Kayıt Ol</Link>
                    </div>
                </div>
        </AuthTemplate>
    );
}
