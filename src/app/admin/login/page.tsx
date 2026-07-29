'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');

  const needsTwoFactor = error === '2FA_REQUIRED' || error === 'INVALID_2FA';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!needsTwoFactor) {
      setError('');
    }
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        code,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === '2FA_REQUIRED' || result.error === 'INVALID_2FA') {
          setError(result.error);
        } else {
          setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
        }
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-7" />
            </div>
            <CardTitle className="text-2xl">Yönetim Paneli</CardTitle>
            <CardDescription>
              {needsTwoFactor
                ? 'Doğrulama uygulamanızdaki 6 haneli kodu girin'
                : 'Devam etmek için oturum açın'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && !needsTwoFactor && (
              <div
                role="alert"
                className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-center text-sm text-destructive"
              >
                {error}
              </div>
            )}
            {error === 'INVALID_2FA' && (
              <div
                role="alert"
                className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-center text-sm text-destructive"
              >
                Doğrulama kodu geçersiz. Lütfen tekrar deneyin.
              </div>
            )}

            {needsTwoFactor ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Doğrulama Kodu (2FA)</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="text-center text-lg tracking-[0.4em]"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Doğrulanıyor...' : 'Giriş Yap'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setError('');
                    setCode('');
                  }}
                  className="w-full"
                >
                  Geri Dön
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="px-9"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    href="/admin/reset-password"
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Şifremi unuttum
                  </Link>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>
              </form>
            )}

            <div className="mt-6 border-t pt-4">
              <Link
                href="/"
                className="flex items-center justify-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="mr-2 size-4" />
                Siteye dön
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} — Tüm hakları saklıdır
        </p>
      </div>
    </div>
  );
}
