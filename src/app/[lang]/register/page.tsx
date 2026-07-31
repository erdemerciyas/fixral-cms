'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams()!;
    const lang = useLocale();
    const redirectUrl = searchParams.get('redirect') || `/${lang}`;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/public/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Kayıt başarısız.');
            }

            // Success
            // Can show a toast or message. For now redirecting to login.
            alert('Kayıt başarılı! Lütfen giriş yapın.');
            router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(redirectUrl)}`); // Or custom login page if exists

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh pt-32 pb-20 bg-background flex items-center justify-center">
            <div className="container-main max-w-md w-full">
                <div className="bg-card p-8 rounded-2xl shadow-xs border border-border">
                    <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Kayıt Ol</h1>
                    <p className="text-muted-foreground mb-8 text-center">
                        Yeni bir hesap oluşturun ve alışverişe başlayın.
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Ad Soyad</label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">E-posta</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Şifre</label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Şifre Tekrar</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
                        Zaten hesabınız var mı? <Link href="/api/auth/signin" className="text-accent-foreground font-bold hover:underline">Giriş Yap</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
