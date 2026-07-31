'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MapPin as MapPinIcon, User as UserIcon, LogOut as ArrowRightOnRectangleIcon, XCircle as XCircleIcon, MessageSquare as ChatBubbleLeftIcon, Trash2 as TrashIcon, Mail as EnvelopeIcon, Megaphone as MegaphoneIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[hsl(var(--scrim)/0.5)] backdrop-blur-xs">
            <div className="bg-card rounded-lg shadow-[var(--shadow-lg)] w-full max-w-md overflow-hidden border border-border">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-bold text-lg text-foreground">{title}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function AccountPage() {
    const { data: session, status } = useSession();
    const { confirm } = useConfirm();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('messages');

    // Messages Logic
    const [messages, setMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
    const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
    const [actionLoading, setActionLoading] = useState(false);

    // Address Logic
    const [addresses, setAddresses] = useState<any[]>([]);
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const [addressForm, setAddressForm] = useState({
        title: '',
        fullName: '',
        phone: '',
        country: 'Türkiye',
        city: '',
        district: '',
        address: '',
        zipCode: '',
        isPrimary: false
    });

    useEffect(() => {
        if (status === 'authenticated') {
            if (activeTab === 'addresses') fetchAddresses();
            if (activeTab === 'messages') fetchMessages();
        }
    }, [activeTab, status]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/public/user/messages?page=1&limit=1').then(res => res.json()).then(data => {
                if (data.success && data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
            });
        }
    }, [status]);

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/public/user/addresses');
            const data = await res.json();
            if (data.success) setAddresses(data.data);
        } catch (error) {
            console.error('Fetch addresses error', error);
        }
    };

    const fetchMessages = async (page = 1) => {
        setLoadingMessages(true);
        try {
            const res = await fetch(`/api/public/user/messages?page=${page}&limit=20`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
                if (data.pagination) {
                    setPagination(data.pagination);
                    setCurrentPage(data.pagination.page);
                }
                if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Fetch messages error', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleMessageSelect = (id: string) => {
        const newSelected = new Set(selectedMessages);
        if (newSelected.has(id)) { newSelected.delete(id); } else { newSelected.add(id); }
        setSelectedMessages(newSelected);
    };

    const handleBulkDeleteMessages = async () => {
        const confirmed = await confirm({
            title: 'Seçilenleri Sil?',
            description: `${selectedMessages.size} mesajı silmek istediğinize emin misiniz?`,
            confirmText: 'Evet, sil!',
            cancelText: 'Vazgeç',
            variant: 'destructive',
        });
        if (!confirmed) return;
        setActionLoading(true);
        try {
            const promises = Array.from(selectedMessages).map(id =>
                fetch(`/api/public/user/messages/${id}`, { method: 'DELETE' })
            );
            await Promise.all(promises);
            setMessages(messages.filter(m => !selectedMessages.has(m._id)));
            setSelectedMessages(new Set());
            toast.success('Seçilen mesajlar silindi.');
        } catch (error) {
            console.error('Bulk delete error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    const openAddressModal = (address: any = null) => {
        if (address) {
            setEditingAddress(address);
            setAddressForm({
                title: address.title,
                fullName: address.fullName,
                phone: address.phone,
                country: address.country,
                city: address.city,
                district: address.district,
                address: address.address,
                zipCode: address.zipCode,
                isPrimary: address.isPrimary
            });
        } else {
            setEditingAddress(null);
            setAddressForm({ title: '', fullName: session?.user?.name || '', phone: '', country: 'Türkiye', city: '', district: '', address: '', zipCode: '', isPrimary: false });
        }
        setAddressModalOpen(true);
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const url = editingAddress ? `/api/public/user/addresses/${editingAddress._id}` : '/api/public/user/addresses';
            const method = editingAddress ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(addressForm) });
            const data = await res.json();
            if (data.success) {
                toast.success(editingAddress ? 'Adres güncellendi.' : 'Adres eklendi.');
                setAddressModalOpen(false);
                fetchAddresses();
            } else {
                toast.error(data.error || 'İşlem başarısız.');
            }
        } catch (error) {
            console.error('Save address error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        const confirmed = await confirm({
            title: 'Emin misiniz?',
            description: 'Bu adresi silmek istediğinize emin misiniz?',
            confirmText: 'Evet, sil!',
            cancelText: 'Vazgeç',
            variant: 'destructive',
        });
        if (!confirmed) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/public/user/addresses/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setAddresses(addresses.filter(a => a._id !== id));
                toast.success('Adres silindi.');
            } else {
                toast.error(data.error || 'Silinemedi.');
            }
        } catch (error) {
            console.error('Delete address error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSetPrimaryAddress = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/public/user/addresses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPrimary: true }) });
            const data = await res.json();
            if (data.success) {
                fetchAddresses();
                toast.success('Varsayılan adres güncellendi.');
            } else {
                toast.error(data.error || 'Güncellenemedi.');
            }
        } catch (error) {
            console.error('Set primary error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-dvh pt-32 pb-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/api/auth/signin');
        return null;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'addresses':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Adreslerim</h2>
                            <button
                                onClick={() => openAddressModal()}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-xs font-medium text-sm hover:bg-primary/90 transition-colors duration-150 motion-reduce:transition-none"
                            >
                                + Yeni Adres Ekle
                            </button>
                        </div>

                        {addresses.length === 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 text-center py-12 bg-surface-secondary rounded-sm border border-dashed border-border">
                                    <div className="mx-auto w-16 h-16 bg-card rounded-sm flex items-center justify-center mb-4 shadow-[var(--shadow-sm)] text-muted-foreground">
                                        <MapPinIcon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">Kayıtlı adresiniz yok</h3>
                                    <p className="text-muted-foreground">Yeni bir adres ekleyin.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {addresses.map((addr) => (
                                    <div key={addr._id} className={`bg-card p-6 rounded-sm border ${addr.isPrimary ? 'border-primary ring-1 ring-ring' : 'border-border'} shadow-[var(--shadow-sm)] relative group`}>
                                        {addr.isPrimary && (
                                            <span className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-xs">Varsayılan</span>
                                        )}
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="p-2 bg-muted rounded-xs text-muted-foreground">
                                                <MapPinIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground">{addr.title}</h3>
                                                <p className="text-sm text-muted-foreground">{addr.fullName}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-sm text-muted-foreground mb-6">
                                            <p>{addr.address}</p>
                                            <p>{addr.district} / {addr.city}</p>
                                            <p>{addr.country}</p>
                                            <p>{addr.phone}</p>
                                        </div>
                                        <div className="pt-4 border-t border-border flex justify-between items-center">
                                            {!addr.isPrimary && (
                                                <button onClick={() => handleSetPrimaryAddress(addr._id)} className="text-sm text-muted-foreground hover:text-accent-foreground font-medium transition-colors">
                                                    Varsayılan Yap
                                                </button>
                                            )}
                                            <div className="flex gap-3 ml-auto">
                                                <button onClick={() => openAddressModal(addr)} className="text-sm text-accent-foreground font-bold hover:underline">Düzenle</button>
                                                <button onClick={() => handleDeleteAddress(addr._id)} className="text-sm text-destructive font-bold hover:underline">Sil</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'messages':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-6">Mesajlarım</h2>
                        {loadingMessages ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-12 bg-surface-secondary rounded-sm border border-dashed border-border">
                                <div className="mx-auto w-16 h-16 bg-card rounded-sm flex items-center justify-center mb-4 shadow-[var(--shadow-sm)] text-muted-foreground">
                                    <EnvelopeIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">Henüz mesajınız yok</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Size özel duyurular ve sorularınızın cevapları burada listelenir.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedMessages.size > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-sm mb-4 animate-in fade-in slide-in-from-top-2">
                                        <span className="text-destructive font-medium px-2">{selectedMessages.size} mesaj seçildi</span>
                                        <button onClick={handleBulkDeleteMessages} disabled={actionLoading} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xs text-sm font-bold hover:bg-destructive/90 transition-colors duration-150 motion-reduce:transition-none w-auto">
                                            {actionLoading ? 'Siliniyor...' : 'Seçilenleri Sil'}
                                        </button>
                                    </div>
                                )}
                                {messages.map((msg) => (
                                    <div key={msg._id} className={`p-6 rounded-sm border relative group transition-colors duration-150 motion-reduce:transition-none ${selectedMessages.has(msg._id) ? 'bg-accent border-border shadow-[var(--shadow-sm)]' : msg.isGlobal || msg.type === 'announcement' ? 'bg-accent border-border' : 'bg-card border-border'}`}>
                                        <div className="absolute top-6 left-4 z-10">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-input text-accent-foreground focus:ring-ring cursor-pointer"
                                                checked={selectedMessages.has(msg._id)}
                                                onChange={() => handleMessageSelect(msg._id)}
                                            />
                                        </div>
                                        <div className="flex items-start gap-4 pl-8">
                                            <div className={`p-3 rounded-xs shrink-0 ${msg.isGlobal || msg.type === 'announcement' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                {msg.isGlobal || msg.type === 'announcement' ? <MegaphoneIcon className="w-6 h-6" /> : <ChatBubbleLeftIcon className="w-6 h-6" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className={`font-bold ${msg.isGlobal || msg.type === 'announcement' ? 'text-accent-foreground' : 'text-foreground'}`}>
                                                            {msg.subject || (msg.isGlobal ? 'Genel Duyuru' : 'Sorunuz')}
                                                        </h3>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(msg.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    {(msg.type === 'announcement' || msg.isGlobal) && (
                                                        <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-xs">Duyuru</span>
                                                    )}
                                                </div>
                                                {msg.conversation && msg.conversation.length > 0 ? (
                                                    <div className="space-y-4 mt-4">
                                                        {msg.conversation.map((chat: any, idx: number) => (
                                                            <div key={idx} className={`flex flex-col ${chat.sender === 'admin' ? 'items-start' : 'items-end'}`}>
                                                                <div className={`max-w-[85%] rounded-lg p-4 ${chat.sender === 'admin' ? 'bg-muted text-foreground rounded-tl-none' : 'bg-primary text-primary-foreground rounded-tr-none'}`}>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs font-bold opacity-80">{chat.sender === 'admin' ? 'Yönetici' : 'Siz'}</span>
                                                                        <span className="text-[10px] opacity-60">{new Date(chat.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                                    </div>
                                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{chat.message}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="text-foreground leading-relaxed mb-4">{msg.message}</div>
                                                        {(msg.adminReply || msg.answer) && (
                                                            <div className="bg-surface-secondary border border-border rounded-sm p-4 mt-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className="w-6 h-6 bg-foreground text-background rounded-xs flex items-center justify-center text-xs font-bold">Y</div>
                                                                    <span className="font-bold text-foreground text-sm">Yönetici Cevabı</span>
                                                                </div>
                                                                <p className="text-muted-foreground text-sm">{msg.adminReply || msg.answer}</p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {messages.length > 0 && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-border">
                                <button onClick={() => fetchMessages(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 border border-border rounded-xs text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Önceki</button>
                                <span className="text-sm font-medium text-muted-foreground">Sayfa {currentPage} / {pagination.totalPages}</span>
                                <button onClick={() => fetchMessages(currentPage + 1)} disabled={currentPage === pagination.totalPages} className="px-4 py-2 border border-border rounded-xs text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Sonraki</button>
                            </div>
                        )}
                    </div>
                );

            case 'profile':
                return (
                    <div className="max-w-xl">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Hesap Bilgilerim</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Ad Soyad</label>
                                <input type="text" defaultValue={session?.user?.name || ''} className="w-full px-4 py-2 rounded-xs border border-input focus-visible:ring-2 focus-visible:ring-ring text-muted-foreground bg-muted" readOnly />
                                <span className="text-xs text-muted-foreground mt-1 block">Değişiklik yapmak için müşteri hizmetleri ile iletişime geçiniz.</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">E-posta</label>
                                <input type="email" defaultValue={session?.user?.email || ''} className="w-full px-4 py-2 rounded-xs border border-input focus-visible:ring-2 focus-visible:ring-ring text-muted-foreground bg-muted" readOnly />
                            </div>
                            <div className="pt-4 border-t border-border mt-6">
                                <h3 className="font-bold text-foreground mb-4">Şifre Değiştir</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Mevcut Şifre</label>
                                        <input type="password" className="w-full px-4 py-2 rounded-xs border border-input bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Yeni Şifre</label>
                                        <input type="password" className="w-full px-4 py-2 rounded-xs border border-input bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden" />
                                    </div>
                                    <button className="px-6 py-2 bg-primary text-primary-foreground rounded-xs font-bold hover:bg-primary/90 transition-colors duration-150 motion-reduce:transition-none">Şifreyi Güncelle</button>
                                </div>
                            </div>
                        </form>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <main className="min-h-dvh pt-28 pb-20 bg-background">
            <div className="bg-foreground pb-20 pt-10">
                <div className="container-main">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-20 h-20 rounded-sm bg-background/10 flex items-center justify-center backdrop-blur-xs border border-background/20 text-background font-bold text-3xl shadow-[var(--shadow-md)]">
                            {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-background mb-2">Merhaba, {session?.user?.name}</h1>
                            <p className="text-background/60">Hesap durumunuzu yönetin.</p>
                        </div>
                        <div className="md:ml-auto flex gap-6 text-center">
                            <div className="bg-background/5 rounded-sm p-4 px-6 border border-background/10 backdrop-blur-xs">
                                <div className="text-2xl font-bold text-background mb-1 font-mono tabular-nums">{unreadCount}</div>
                                <div className="text-xs text-background/60 font-mono font-medium uppercase tracking-[0.14em]">Mesaj</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-main -mt-10">
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-3">
                        <div className="bg-card rounded-sm shadow-[var(--shadow-sm)] border border-border sticky top-24 overflow-hidden">
                            <nav className="p-2 space-y-1">
                                <button
                                    onClick={() => setActiveTab('messages')}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xs transition-colors duration-150 motion-reduce:transition-none text-left font-medium ${activeTab === 'messages' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                                >
                                    <div className="flex-1 flex items-center gap-3">
                                        <EnvelopeIcon className={`w-5 h-5 ${activeTab === 'messages' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                        Mesajlarım
                                    </div>
                                    {unreadCount > 0 && (
                                        <span className={`text-[10px] font-bold font-mono tabular-nums px-2 py-0.5 rounded-xs ${activeTab === 'messages' ? 'bg-primary-foreground text-primary' : 'bg-destructive text-destructive-foreground'}`}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xs transition-colors duration-150 motion-reduce:transition-none text-left font-medium ${activeTab === 'addresses' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                                >
                                    <MapPinIcon className={`w-5 h-5 ${activeTab === 'addresses' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                    Adreslerim
                                </button>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xs transition-colors duration-150 motion-reduce:transition-none text-left font-medium ${activeTab === 'profile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                                >
                                    <UserIcon className={`w-5 h-5 ${activeTab === 'profile' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                    Hesap Bilgilerim
                                </button>
                                <div className="my-2 border-t border-border"></div>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xs transition-colors text-left text-destructive hover:bg-destructive/10 font-medium group"
                                >
                                    <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
                                    Çıkış Yap
                                </button>
                            </nav>
                        </div>
                    </div>

                    <div className="lg:col-span-9">
                        <div className="bg-card p-8 rounded-sm shadow-[var(--shadow-sm)] border border-border min-h-[500px]">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={addressModalOpen} onClose={() => setAddressModalOpen(false)} title={editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}>
                <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Adres Başlığı (Ev, İş vb.)</label>
                        <input type="text" required className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden" value={addressForm.title} onChange={e => setAddressForm({ ...addressForm, title: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Ad Soyad</label>
                            <input type="text" required className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden" value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Telefon</label>
                            <input type="text" required className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Ülke</label>
                        <input type="text" className="w-full px-3 py-2 border border-input rounded-xs bg-muted text-muted-foreground" value="Türkiye" readOnly />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Şehir (İl)</label>
                            <input type="text" required className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">İlçe</label>
                            <input type="text" required className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden" value={addressForm.district} onChange={e => setAddressForm({ ...addressForm, district: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Açık Adres</label>
                        <textarea rows={3} required className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden resize-none" value={addressForm.address} onChange={e => setAddressForm({ ...addressForm, address: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Posta Kodu (Opsiyonel)</label>
                            <input type="text" className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary outline-hidden" value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground font-medium">
                                <input type="checkbox" className="w-4 h-4 text-accent-foreground rounded border-input focus:ring-ring" checked={addressForm.isPrimary} onChange={e => setAddressForm({ ...addressForm, isPrimary: e.target.checked })} />
                                Varsayılan adres olarak ayarla
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={() => setAddressModalOpen(false)} className="px-4 py-2 border border-border rounded-xs text-muted-foreground hover:bg-accent font-bold">Vazgeç</button>
                        <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary text-primary-foreground rounded-xs hover:bg-primary/90 font-bold disabled:opacity-50">
                            {actionLoading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </Modal>
        </main>
    );
}
