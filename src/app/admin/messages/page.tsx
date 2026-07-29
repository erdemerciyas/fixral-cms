'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
import { AdminPageLayout } from '@/components/admin/admin-page-layout';

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
  type?: 'contact' | 'service_request' | 'announcement' | 'reply';
  projectType?: string;
  budget?: string;
  urgency?: string;
  adminReply?: string;
  repliedAt?: string;
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
      case 'urgent': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive">Acil</span>;
      case 'high': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning">Yüksek</span>;
      case 'medium': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning">Orta</span>;
      default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/15 text-success">Düşük</span>;
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
    <AdminPageLayout
      title="Mesajlar"
      description="Gelen kutusu ve proje başvuruları"
      actions={
        <span className="text-sm text-muted-foreground bg-card px-3 py-1 rounded-full border border-border shadow-sm">
          {unreadCount} okunmamış
        </span>
      }
    >
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
              className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>
          <div className="flex space-x-2 bg-muted p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'all'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setStatusFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'unread'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Okunmamış
            </button>
            <button
              onClick={() => setStatusFilter('read')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'read'
                ? 'bg-card text-primary shadow-sm'
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
              className="flex items-center px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors text-sm font-medium"
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
                className="w-4 h-4 text-primary border-border rounded focus:ring-ring mr-4 cursor-pointer"
              />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tümünü Seç</span>
            </div>
            <div className="divide-y divide-border">
              {filteredMessages.map((message) => (
                <div
                  key={message._id}
                  className={`group p-6 hover:bg-muted/50 transition-colors cursor-pointer relative ${message.status === 'unread' || message.status === 'new' ? 'bg-primary/5' : ''
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
                        className="w-4 h-4 text-primary border-border rounded focus:ring-ring cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-semibold ${(message.status === 'unread' || message.status === 'new') ? 'text-foreground' : 'text-foreground'}`}>
                            {message.name}
                          </h3>
                          {message.company && (
                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                              <Building className="w-3 h-3 mr-1" />
                              {message.company}
                            </span>
                          )}
                          {message.projectType && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-info/10 text-info border border-info/30">
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
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                        )}
                        {message.status === 'replied' && (
                          <span className="text-xs text-success flex items-center gap-0.5 bg-success/10 px-1.5 py-0.5 rounded">
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
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden rounded-xl bg-card">
                  {viewMessage && (
                    <div className="flex flex-col max-h-[90vh]">
                      {/* Modal Header */}
                      <div className="px-6 py-4 border-b border-border bg-muted/50 flex items-center justify-between">
                        <div>
                          <DialogTitle className="text-lg font-bold text-foreground">
                            {viewMessage.subject}
                          </DialogTitle>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <span>{formatDate(viewMessage.createdAt)}</span>
                            {viewMessage.urgency && (
                              <span className="ml-2">{getUrgencyBadge(viewMessage.urgency)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Sender Info Card */}
                        <div className="bg-muted/50 rounded-xl p-4 border border-border">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Gönderen Bilgileri</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
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
                          <div className="bg-info/10 rounded-xl p-4 border border-info/30">
                            <h4 className="text-xs font-bold text-info uppercase tracking-wider mb-2">Proje Detayları</h4>
                            <div className="flex flex-wrap gap-4 text-sm">
                              {viewMessage.projectType && (
                                <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-info/30 shadow-sm text-info">
                                  <Flame className="w-4 h-4 text-warning" />
                                  <span className="font-medium">{viewMessage.projectType}</span>
                                </div>
                              )}
                              {viewMessage.budget && (
                                <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-info/30 shadow-sm text-info">
                                  <DollarSign className="w-4 h-4 text-success" />
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
                          <div className="pl-4 border-l-4 border-success bg-success/10 rounded-r-xl p-4">
                            <h4 className="text-xs font-bold text-success uppercase tracking-wider mb-2 flex items-center gap-2">
                              <Check className="w-4 h-4" />
                              Gönderilen Yanıt
                              <span className="text-success/70 font-normal lowercase ml-auto">{viewMessage.repliedAt && formatDate(viewMessage.repliedAt)}</span>
                            </h4>
                            <div className="text-success text-sm whitespace-pre-wrap">
                              {viewMessage.adminReply}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reply Form */}
                      <div className="p-6 bg-muted/50 border-t border-border">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Send className="w-4 h-4 text-primary" />
                          Yanıt Gönder
                        </h4>
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full rounded-xl border border-border shadow-sm focus:border-ring focus:ring-ring text-sm p-3 min-h-[100px]"
                          placeholder="Müşteriye gönderilecek yanıtınızı buraya yazın..."
                        />
                        <div className="mt-3 flex justify-end gap-3">
                          <Button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                          >
                            Kapat
                          </Button>
                          <Button
                            type="button"
                            onClick={handleSendReply}
                            disabled={!replyText.trim() || sendingReply}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sendingReply ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
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
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}
