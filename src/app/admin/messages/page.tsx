'use client';

import { useState, useEffect, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import {
  MessageSquare,
  Search,
  Trash2,
  Mail,
  Check,
  Clock,
  Send,
  Building,
  DollarSign,
  Flame,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface Message {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'new' | 'replied' | 'closed';
  createdAt: string;
  type?: 'contact' | 'product_question' | 'service_request' | 'announcement' | 'reply' | 'order_question';
  productId?: string;
  productName?: string;
  projectType?: string;
  budget?: string;
  urgency?: string;
  adminReply?: string;
  repliedAt?: string;
  orderId?: string;
}

export default function AdminMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

  // Reply Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMessage, setViewMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadMessages();
  }, [status, router]);

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages?scope=general');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    const confirmed = await confirm({
      title: 'Mesajı Sil',
      description: 'Bu mesajı silmek istediğinize emin misiniz?',
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(messages.filter(msg => msg._id !== messageId));
        if (viewMessage?._id === messageId) setIsModalOpen(false);
        toast.success('Mesaj silindi');
      } else {
        toast.error('Mesaj silinemedi');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await confirm({
      title: 'Toplu Silme',
      description: `${selectedMessages.size} mesajı silmek istediğinize emin misiniz?`,
    });

    if (!confirmed) return;

    try {
      await Promise.all(
        Array.from(selectedMessages).map(id =>
          fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
        )
      );
      setMessages(messages.filter(msg => !selectedMessages.has(msg._id)));
      setSelectedMessages(new Set());
      toast.success('Seçilen mesajlar silindi');
    } catch (error) {
      console.error('Error deleting messages:', error);
      toast.error('Silme işleminde hata oluştu');
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    const message = messages.find(m => m._id === messageId);
    if (message?.status === 'read' || message?.status === 'replied') return;

    try {
      const response = await fetch(`/api/admin/messages/${messageId}/read`, {
        method: 'POST',
      });

      if (response.ok) {
        setMessages(messages.map(msg =>
          msg._id === messageId ? { ...msg, status: 'read' as const } : msg
        ));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const openMessageDetail = (message: Message) => {
    setViewMessage(message);
    setReplyText('');
    setIsModalOpen(true);
    handleMarkAsRead(message._id);
  };

  const handleSendReply = async () => {
    if (!viewMessage || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const response = await fetch('/api/admin/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: viewMessage._id,
          reply: replyText
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Yanıt gönderildi');
        setMessages(messages.map(msg =>
          msg._id === viewMessage._id ? {
            ...msg,
            status: 'replied',
            adminReply: replyText,
            repliedAt: new Date().toISOString()
          } : msg
        ));
        setIsModalOpen(false);
      } else {
        toast.error(data.error || 'Yanıt gönderilemedi');
      }
    } catch (error) {
      console.error('Reply error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setSendingReply(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'unread') {
      matchesStatus = message.status === 'unread' || message.status === 'new';
    } else if (statusFilter === 'read') {
      matchesStatus = message.status === 'read' || message.status === 'replied' || message.status === 'closed';
    }

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUrgencyBadge = (urgency?: string) => {
    switch (urgency) {
      case 'urgent': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Acil</span>;
      case 'high': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">Yüksek</span>;
      case 'medium': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Orta</span>;
      default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Düşük</span>;
    }
  };

  const unreadCount = messages.filter(m => m.status === 'unread' || m.status === 'new').length;

  if (status === 'loading' || loading) {
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mesajlar</h1>
          <p className="text-muted-foreground mt-1">Gelen kutusu ve proje başvuruları</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground bg-card px-3 py-1 rounded-full border border-border shadow-sm">
            {unreadCount} okunmamış
          </span>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mesajlarda ara..."
              className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex space-x-2 bg-muted p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'all'
                ? 'bg-card text-indigo-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setStatusFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'unread'
                ? 'bg-card text-indigo-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Okunmamış
            </button>
            <button
              onClick={() => setStatusFilter('read')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'read'
                ? 'bg-card text-indigo-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Okunmuş
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedMessages.size > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {selectedMessages.size} mesaj seçildi
            </p>
            <Button
              type="button"
              onClick={handleBulkDelete}
              className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Seçilenleri Sil
            </Button>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 overflow-hidden">
        {filteredMessages.length > 0 ? (
          <>
            <div className="px-6 py-3 border-b border-border bg-muted/50 flex items-center">
              <input
                type="checkbox"
                checked={selectedMessages.size > 0 && selectedMessages.size === filteredMessages.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMessages(new Set(filteredMessages.map(m => m._id)));
                  } else {
                    setSelectedMessages(new Set());
                  }
                }}
                className="w-4 h-4 text-indigo-600 border-border rounded focus:ring-indigo-500 mr-4 cursor-pointer"
              />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tümünü Seç</span>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredMessages.map((message) => (
                <div
                  key={message._id}
                  className={`group p-6 hover:bg-muted/50 transition-colors cursor-pointer relative ${message.status === 'unread' || message.status === 'new' ? 'bg-indigo-50/40' : ''
                    }`}
                  onClick={() => openMessageDetail(message)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedMessages.has(message._id)}
                        onChange={() => {
                          const newSelected = new Set(selectedMessages);
                          if (newSelected.has(message._id)) {
                            newSelected.delete(message._id);
                          } else {
                            newSelected.add(message._id);
                          }
                          setSelectedMessages(newSelected);
                        }}
                        className="w-4 h-4 text-indigo-600 border-border rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-semibold ${(message.status === 'unread' || message.status === 'new') ? 'text-indigo-900' : 'text-foreground'}`}>
                            {message.name}
                          </h3>
                          {message.company && (
                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                              <Building className="w-3 h-3 mr-1" />
                              {message.company}
                            </span>
                          )}
                          {message.projectType && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                              <Briefcase className="w-3 h-3 mr-1" />
                              {message.projectType}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(message.createdAt)}
                        </span>
                      </div>

                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="text-sm font-medium text-foreground">
                          {message.subject}
                        </h4>
                        {(message.status === 'unread' || message.status === 'new') && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        )}
                        {message.status === 'replied' && (
                          <span className="text-xs text-green-600 flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded">
                            <Check className="w-3 h-3" />
                            Yanıtlandı
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.message}
                      </p>
                    </div>

                    <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(message._id);
                        }}
                        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Mesaj Bulunamadı</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery || statusFilter !== 'all'
                ? 'Arama kriterlerinizi değiştirmeyi deneyin.'
                : 'Henüz hiç mesajınız yok.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Detail / Reply Modal */}
      <Transition show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-card text-left align-middle shadow-xl transition-all">
                  {viewMessage && (
                    <div className="flex flex-col max-h-[90vh]">
                      {/* Modal Header */}
                      <div className="px-6 py-4 border-b border-slate-100 bg-muted/50 flex items-center justify-between">
                        <div>
                          <Dialog.Title as="h3" className="text-lg font-bold text-foreground">
                            {viewMessage.subject}
                          </Dialog.Title>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <span>{formatDate(viewMessage.createdAt)}</span>
                            {viewMessage.urgency && (
                              <span className="ml-2">{getUrgencyBadge(viewMessage.urgency)}</span>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="text-muted-foreground hover:text-muted-foreground"
                        >
                          <span className="sr-only">Kapat</span>
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Sender Info Card */}
                        <div className="bg-muted/50 rounded-xl p-4 border border-slate-100">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Gönderen Bilgileri</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                {viewMessage.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{viewMessage.name}</div>
                                <div className="text-xs text-muted-foreground">{viewMessage.email}</div>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              {viewMessage.phone && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Tel:</span>
                                  {viewMessage.phone}
                                </div>
                              )}
                              {viewMessage.company && (
                                <div className="flex items-center gap-2">
                                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                                  {viewMessage.company}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Project Details (if applicable) */}
                        {(viewMessage.projectType || viewMessage.budget) && (
                          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                            <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Proje Detayları</h4>
                            <div className="flex flex-wrap gap-4 text-sm">
                              {viewMessage.projectType && (
                                <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm text-blue-900">
                                  <Flame className="w-4 h-4 text-orange-500" />
                                  <span className="font-medium">{viewMessage.projectType}</span>
                                </div>
                              )}
                              {viewMessage.budget && (
                                <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm text-blue-900">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span className="font-medium">Bütçe: {viewMessage.budget}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Message Content */}
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Mesaj İçeriği</h4>
                          <div className="bg-card p-4 rounded-xl border border-border text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                            {viewMessage.message}
                          </div>
                        </div>

                        {/* Previous Admin Reply */}
                        {viewMessage.adminReply && (
                          <div className="pl-4 border-l-4 border-green-500 bg-green-50 rounded-r-xl p-4">
                            <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                              <Check className="w-4 h-4" />
                              Gönderilen Yanıt
                              <span className="text-green-600/70 font-normal lowercase ml-auto">{viewMessage.repliedAt && formatDate(viewMessage.repliedAt)}</span>
                            </h4>
                            <div className="text-green-900 text-sm whitespace-pre-wrap">
                              {viewMessage.adminReply}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reply Form */}
                      <div className="p-6 bg-muted/50 border-t border-border">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Send className="w-4 h-4 text-indigo-600" />
                          Yanıt Gönder
                        </h4>
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full rounded-xl border border-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-3 min-h-[100px]"
                          placeholder="Müşteriye gönderilecek yanıtınızı buraya yazın..."
                        />
                        <div className="mt-3 flex justify-end gap-3">
                          <Button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            Kapat
                          </Button>
                          <Button
                            type="button"
                            onClick={handleSendReply}
                            disabled={!replyText.trim() || sendingReply}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sendingReply ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Gönderiliyor...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Yanıtla ve E-posta Gönder
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
