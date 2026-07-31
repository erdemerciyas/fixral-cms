
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck,
    Smartphone,
    CheckCircle,
    XCircle,
    User,
    Key,
    Image as ImageIcon,
    Mail
} from 'lucide-react';
import Image from 'next/image';
import MediaBrowser from '@/components/MediaBrowser';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
    const router = useRouter();
    const { confirm } = useConfirm();

    // UI State
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | '2fa'>('profile');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isMediaBrowserOpen, setIsMediaBrowserOpen] = useState(false);

    // Profile Data State
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        avatar: '',
        role: ''
    });

    // Password State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    // 2FA State
    const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

    // Fetch User Data
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/admin/profile');
            const data = await res.json();
            if (res.ok) {
                setUserData({
                    name: data.name || '',
                    email: data.email || '',
                    avatar: data.avatar || '',
                    role: data.role || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setPageLoading(false);
        }
    };

    // Profile Handlers
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                    avatar: userData.avatar
                })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profil başarıyla güncellendi' });
                setUserData(prev => ({ ...prev, ...data.user }));
                router.refresh(); // Refresh server components like header
            } else {
                setMessage({ type: 'error', text: data.error || 'Güncelleme başarısız' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' });
        } finally {
            setLoading(false);
        }
    };

    // Password Handlers
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor' });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/admin/profile/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi' });
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Şifre değiştirilemedi' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' });
        } finally {
            setLoading(false);
        }
    };

    // 2FA Handlers
    const startSetup = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/2fa/setup', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setSetupData(data);
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to start setup' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const verifyAndEnable = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/2fa/setup', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: verificationCode }),
            });
            const data = await res.json();

            if (res.ok) {
                setBackupCodes(data.backupCodes);
                setSetupData(null);
                setVerificationCode('');
                setMessage({ type: 'success', text: 'İki Aşamalı Doğrulama başarıyla etkinleştirildi!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Doğrulama başarısız' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' });
        } finally {
            setLoading(false);
        }
    };

    const disable2FA = async () => {
        const confirmed = await confirm({ title: 'Emin misiniz?', description: '2FA\'yı devre dışı bırakmak istediğinize emin misiniz? Hesabınızın güvenliği azalacaktır.' });
        if (!confirmed) return;

        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/2fa/setup', { method: 'DELETE' });
            if (res.ok) {
                setMessage({ type: 'success', text: 'İki Aşamalı Doğrulama devre dışı bırakıldı.' });
                setBackupCodes(null);
                toast.success('2FA devre dışı bırakıldı');
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Devre dışı bırakılamadı' });
                toast.error(data.error || 'Devre dışı bırakılamadı');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' });
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-primary to-primary rounded-xl p-8 text-primary-foreground shadow-lg">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full border-4 border-primary-foreground/30 overflow-hidden bg-primary-foreground/10 backdrop-blur-xs flex items-center justify-center relative">
                            {userData.avatar ? (
                                <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold">{userData.name?.[0]?.toUpperCase()}</span>
                            )}
                            <Button
                                onClick={() => setIsMediaBrowserOpen(true)}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <ImageIcon className="w-6 h-6 text-white" />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1 text-primary-foreground">{userData.name}</h1>
                        <p className="text-primary-foreground/80 opacity-90">{userData.email}</p>
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-foreground/15 text-primary-foreground">
                            {userData.role.toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-border">
                <Button
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'profile'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <User className="w-4 h-4" />
                    Profil Bilgileri
                </Button>
                <Button
                    onClick={() => setActiveTab('security')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'security'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Key className="w-4 h-4" />
                    Şifre Değiştir
                </Button>
                <Button
                    onClick={() => setActiveTab('2fa')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === '2fa'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    İki Aşamalı Doğrulama
                </Button>
            </div>

            {/* Messages */}
            {message && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-success/10 border-success/30 text-success' : 'bg-destructive/10 border-destructive/30 text-destructive'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Content Area */}
            <div className="bg-card rounded-xl shadow-xs border border-border p-6 min-h-[400px]">

                {/* 1. Profile Tab */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleUpdateProfile} className="max-w-2xl space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="block text-sm font-medium text-foreground">Ad Soyad</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <Input
                                        type="text"
                                        value={userData.name}
                                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                        className="pl-10 w-full rounded-xl border-border focus:ring-ring focus:border-ring"
                                        placeholder="Adınız Soyadınız"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="block text-sm font-medium text-foreground">E-posta Adresi</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <Input
                                        type="email"
                                        value={userData.email}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                        className="pl-10 w-full rounded-xl border-border focus:ring-ring focus:border-ring"
                                        placeholder="ornek@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium shadow-xs hover:shadow-primary/25"
                            >
                                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </Button>
                        </div>
                    </form>
                )}

                {/* 2. Security Tab (Password) */}
                {activeTab === 'security' && (
                    <form onSubmit={handleChangePassword} className="max-w-xl space-y-6 animate-in fade-in">
                        <div className="space-y-2">
                            <Label className="block text-sm font-medium text-foreground">Mevcut Şifre</Label>
                            <Input
                                type="password"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                className="w-full rounded-xl border-border focus:ring-ring focus:border-ring"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="block text-sm font-medium text-foreground">Yeni Şifre</Label>
                            <Input
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full rounded-xl border-border focus:ring-ring focus:border-ring"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="block text-sm font-medium text-foreground">Yeni Şifre (Tekrar)</Label>
                            <Input
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="w-full rounded-xl border-border focus:ring-ring focus:border-ring"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium shadow-xs hover:shadow-primary/25"
                            >
                                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                            </Button>
                        </div>
                    </form>
                )}

                {/* 3. 2FA Tab */}
                {activeTab === '2fa' && (
                    <div className="max-w-2xl animate-in fade-in">
                        <div className="bg-primary/10 rounded-xl p-6 mb-8 border border-primary/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-card rounded-full shadow-xs text-primary">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Hesabınızı Koruyun</h3>
                                    <p className="text-primary text-sm">
                                        İki aşamalı doğrulama, hesabınıza yetkisiz erişimi engellemek için ekstra bir güvenlik katmanı sağlar.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!setupData && !backupCodes ? (
                            <div className="flex flex-col gap-4">
                                <Button
                                    onClick={startSetup}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/25 transform hover:-translate-y-0.5"
                                >
                                    <Smartphone className="w-6 h-6" />
                                    <span className="font-semibold text-lg">{loading ? 'Hazırlanıyor...' : '2FA Kurulumunu Başlat'}</span>
                                </Button>

                                <div className="mt-4 pt-4 border-t border-border">
                                    <Button
                                        onClick={disable2FA}
                                        className="text-sm text-destructive hover:text-destructive font-medium flex items-center gap-2 px-2 py-1 rounded hover:bg-destructive/10 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Mevcut 2FA Kurulumunu Kaldır / Devre Dışı Bırak
                                    </Button>
                                </div>
                            </div>
                        ) : setupData ? (
                            <div className="space-y-8">
                                <ol className="list-decimal list-inside space-y-4 text-muted-foreground border-l-2 border-border pl-4">
                                    <li>Telefonunuza <strong>Google Authenticator</strong> veya benzeri bir uygulama indirin.</li>
                                    <li>Uygulamadan "QR Kodu Tara" seçeneğini seçin.</li>
                                    <li>Aşağıdaki QR kodu taratın veya manuel kodu girin.</li>
                                </ol>

                                <div className="flex flex-col md:flex-row gap-8 items-center bg-muted/50 p-6 rounded-xl border border-border">
                                    {setupData.qrCodeUrl && (
                                        <div className="bg-card p-2 rounded-xl shadow-xs border border-border">
                                            <Image
                                                src={setupData.qrCodeUrl}
                                                alt="QR Code"
                                                width={180}
                                                height={180}
                                                className="object-contain"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 text-center md:text-left">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Manuel Kurulum Kodu</p>
                                        <code className="text-xl font-mono block break-all bg-card p-3 rounded-lg border border-border text-foreground select-all">
                                            {setupData.secret}
                                        </code>
                                    </div>
                                </div>

                                <div className="max-w-xs">
                                    <Label className="block text-sm font-medium text-foreground mb-2">Doğrulama Kodu</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000 000"
                                            className="flex-1 px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring outline-hidden text-center tracking-[0.5em] text-xl font-mono"
                                        />
                                    </div>
                                    <Button
                                        onClick={verifyAndEnable}
                                        disabled={loading || verificationCode.length !== 6}
                                        className="mt-4 w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 font-semibold shadow-lg shadow-primary/20"
                                    >
                                        Doğrula ve Etkinleştir
                                    </Button>
                                </div>

                                <Button
                                    onClick={() => setSetupData(null)}
                                    className="text-muted-foreground text-sm hover:text-muted-foreground underline decoration-border underline-offset-4"
                                >
                                    Kurulumu İptal Et
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-success/10 p-8 rounded-xl border border-success/30 text-center">
                                <div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-4 text-success">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-success mb-2">Kurulum Başarıyla Tamamlandı!</h3>
                                <p className="text-success mb-6 max-w-md mx-auto">
                                    Hesabınız artık 2FA ile korunuyor. Erişimini kaybetmeniz durumunda kullanabileceğiniz yedek kodlar aşağıdadır.
                                </p>

                                <div className="bg-card p-6 rounded-xl border border-success/30 shadow-xs max-w-lg mx-auto mb-6">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">Kurtarma Kodları</p>
                                    <div className="grid grid-cols-2 gap-3 font-mono text-muted-foreground">
                                        {backupCodes?.map((code, i) => (
                                            <div key={i} className="bg-muted/50 py-1.5 px-2 rounded text-center select-all hover:bg-muted transition-colors cursor-copy">{code}</div>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setBackupCodes(null)}
                                    className="px-8 py-3 bg-success text-success-foreground rounded-xl hover:bg-success-dark transition-colors font-medium shadow-lg shadow-success/20"
                                >
                                    Kodları Güvenli Bir Yere Kaydettim
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Media Browser Modal */}
            <MediaBrowser
                isOpen={isMediaBrowserOpen}
                onClose={() => setIsMediaBrowserOpen(false)}
                onSelect={(url) => {
                    if (Array.isArray(url)) {
                        setUserData({ ...userData, avatar: url[0] });
                    } else {
                        setUserData({ ...userData, avatar: url });
                    }
                    setIsMediaBrowserOpen(false);
                }}
                onUploadNew={() => {
                    // Fallback
                }}
                title="Profil Fotoğrafı Seç"
                allowedTypes={['image/']}
                pageContext="profile"
                enableInlineUpload={true}
            />
        </div>
    );
}
