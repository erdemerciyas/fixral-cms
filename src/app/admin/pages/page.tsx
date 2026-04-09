'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Reorder, useDragControls } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { resolveIcon, availableIcons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface PageItem {
  _id: string;
  pageId: string;
  title: string;
  path: string;
  description: string;
  icon?: string;
  isActive: boolean;
  showInNavigation: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPagesPage() {
  const { status } = useSession();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [hasReordered, setHasReordered] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Edit Modal State
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    path: '',
    description: '',
    icon: '',
    showInNavigation: true
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadPages();
  }, [status, router]);

  const loadPages = async () => {
    try {
      const response = await fetch('/api/admin/pages', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (response.ok) {
        const data = await response.json();
        setPages(data);
      }
    } catch (error) {
      console.error('Sayfalar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (page: PageItem) => {
    try {
      // Optimistic update
      const newStatus = !page.isActive;
      const updatedPages = pages.map(p =>
        p._id === page._id ? { ...p, isActive: newStatus } : p
      );
      setPages(updatedPages);

      const response = await fetch(`/api/admin/pages/${page._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        setPages(pages);
        toast.error('Durum güncellenemedi');
      } else {
        toast.success('Durum güncellendi');
      }
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      setPages(pages);
      toast.error('Bir hata oluştu');
    }
  };

  const handleReorder = (newOrder: PageItem[]) => {
    setPages(newOrder);
    setHasReordered(true);
  };

  const saveOrder = async () => {
    if (!hasReordered) return;

    setSavingOrder(true);
    try {
      const updates = pages.map((page, index) => ({
        pageId: page.pageId,
        order: index
      }));

      const response = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setHasReordered(false);
        loadPages();
        toast.success('Sıralama kaydedildi');
      } else {
        toast.error('Sıralama kaydedilemedi');
      }
    } catch (error) {
      console.error('Sıralama kaydedilirken hata:', error);
      toast.error('Sıralama kaydedilirken hata oluştu');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    const confirmed = await confirm({
      title: 'Emin misiniz?',
      description: 'Bu sayfayı silmek istediğinizden emin misiniz?',
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPages(pages.filter(page => page._id !== pageId));
        toast.success('Sayfa silindi');
      } else {
        toast.error('Sayfa silinemedi');
      }
    } catch (error) {
      console.error('Sayfa silinirken hata:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const openCreateModal = () => {
    setEditingPage(null);
    setEditForm({
      title: '',
      path: '/',
      description: '',
      icon: '',
      showInNavigation: true
    });
    setIsEditModalOpen(true);
  };

  const openEditModal = (page: PageItem) => {
    setEditingPage(page);
    setEditForm({
      title: page.title,
      path: page.path,
      description: page.description,
      icon: page.icon || '',
      showInNavigation: page.showInNavigation
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPage) {
        const response = await fetch(`/api/admin/pages/${editingPage._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        });

        if (response.ok) {
          setPages(pages.map(p => p._id === editingPage._id ? { ...p, ...editForm } : p));
          setIsEditModalOpen(false);
          setEditingPage(null);
          loadPages();
          toast.success('Sayfa güncellendi');
        } else {
          toast.error('Sayfa güncellenemedi');
        }
      } else {
        const response = await fetch('/api/admin/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        });

        if (response.ok) {
          setIsEditModalOpen(false);
          loadPages();
          toast.success('Sayfa oluşturuldu');
        } else {
          toast.error('Sayfa oluşturulamadı');
        }
      }
    } catch (error) {
      console.error('İşlem hatası:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && page.isActive) ||
      (statusFilter === 'draft' && !page.isActive);
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isReorderEnabled = searchQuery === '' && statusFilter === 'all';

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
    <div className="space-y-6 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sayfalar</h1>
          <p className="text-muted-foreground mt-1">Site sayfalarınızı yönetin</p>
        </div>
        <div className="flex gap-3">
          {hasReordered && (
            <Button
              variant="default"
              onClick={saveOrder}
              disabled={savingOrder}
              className="h-auto rounded-xl px-6 py-3 bg-emerald-600 text-primary-foreground hover:bg-emerald-700"
            >
              {savingOrder ? (
                <div className="mr-2 size-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                <CheckCircle className="mr-2 size-5" />
              )}
              Sıralamayı Kaydet
            </Button>
          )}
          <Button
            size="lg"
            onClick={openCreateModal}
            className="h-auto rounded-xl px-6 py-3 font-semibold shadow-none hover:shadow-lg hover:shadow-primary/30"
          >
            <Plus className="size-5" />
            Sayfa Oluştur
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sayfa ara..."
              className="h-auto rounded-xl py-3 pl-11 pr-4 focus-visible:ring-primary"
            />
          </div>
          <div className="flex space-x-2 rounded-xl bg-muted p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'rounded-lg font-medium',
                statusFilter === 'all'
                  ? 'bg-card text-primary shadow-sm hover:bg-card hover:text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Tümü ({pages.length})
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('published')}
              className={cn(
                'rounded-lg font-medium',
                statusFilter === 'published'
                  ? 'bg-card text-primary shadow-sm hover:bg-card hover:text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Aktif ({pages.filter(p => p.isActive).length})
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('draft')}
              className={cn(
                'rounded-lg font-medium',
                statusFilter === 'draft'
                  ? 'bg-card text-primary shadow-sm hover:bg-card hover:text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Pasif ({pages.filter(p => !p.isActive).length})
            </Button>
          </div>
        </div>
        {!isReorderEnabled && (
          <div className="mt-2 text-xs text-amber-600 flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" />
            Sıralama yapmak için filtreleri temizleyin (Arama yaparken sıralama devre dışıdır)
          </div>
        )}
        </CardContent>
      </Card>

      {/* Pages List */}
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-0">
        {filteredPages.length > 0 ? (
          isReorderEnabled ? (
            <Reorder.Group axis="y" values={filteredPages} onReorder={handleReorder} className="divide-y divide-border">
              {filteredPages.map((page) => (
                <DraggablePageItem
                  key={page._id}
                  page={page}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  onStatusToggle={handleStatusToggle}
                  formatDate={formatDate}
                />
              ))}
            </Reorder.Group>
          ) : (
            <div className="divide-y divide-border">
              {filteredPages.map((page) => (
                <PageListItem
                  key={page._id}
                  page={page}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  onStatusToggle={handleStatusToggle}
                  formatDate={formatDate}
                  isDraggable={false}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Sayfa bulunamadı</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Aramanızı veya filtrenizi değiştirmeyi deneyin'
                : 'Sayfalar Site Ayarları sayfasından yönetilir'
              }
            </p>
          </div>
        )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setEditingPage(null);
        }}
      >
        <DialogContent className="max-w-lg rounded-xl p-8 sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingPage ? 'Sayfa Düzenle' : 'Yeni Sayfa Oluştur'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Başlık</Label>
              <Input
                id="edit-title"
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="rounded-lg focus-visible:ring-primary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-path">Yol (Path)</Label>
              <Input
                id="edit-path"
                type="text"
                value={editForm.path}
                onChange={(e) => setEditForm({ ...editForm, path: e.target.value })}
                className="rounded-lg focus-visible:ring-primary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Açıklama</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="rounded-lg focus-visible:ring-primary/50"
                rows={3}
                required
              />
            </div>
            {/* Icon Picker */}
            <div className="space-y-2">
              <Label>İkon</Label>
              <div className="grid grid-cols-5 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditForm({ ...editForm, icon: '' })}
                  className={cn(
                    'flex h-auto flex-col gap-0.5 rounded-lg border-2 p-2 text-xs font-normal',
                    !editForm.icon
                      ? 'border-primary bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary'
                      : 'border-border text-muted-foreground hover:border-border hover:bg-muted/50'
                  )}
                  title="İkon yok"
                >
                  <X className="size-5" />
                  <span>Yok</span>
                </Button>
                {availableIcons.map((iconItem) => {
                  const IconComp = resolveIcon(iconItem.name);
                  if (!IconComp) return null;
                  const isSelected = editForm.icon === iconItem.name;
                  return (
                    <Button
                      key={iconItem.name}
                      type="button"
                      variant="outline"
                      onClick={() => setEditForm({ ...editForm, icon: iconItem.name })}
                      className={cn(
                        'flex h-auto flex-col gap-0.5 rounded-lg border-2 p-2 text-xs font-normal',
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary'
                          : 'border-border text-muted-foreground hover:border-border hover:bg-muted/50'
                      )}
                      title={iconItem.label}
                    >
                      <IconComp className="size-5" />
                      <span className="w-full truncate text-center">{iconItem.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="showInNav"
                checked={editForm.showInNavigation}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, showInNavigation: checked === true })
                }
              />
              <Label htmlFor="showInNav" className="text-sm font-normal">
                Menüde Göster
              </Label>
            </div>

            <DialogFooter className="mt-6 gap-3 sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingPage(null);
                }}
              >
                İptal
              </Button>
              <Button type="submit">Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper to get page icon component
function PageIconDisplay({ page }: { page: PageItem }) {
  const IconComp = page.icon ? resolveIcon(page.icon) : null;
  if (IconComp) {
    return <IconComp className="size-5 text-primary-foreground" />;
  }
  return <FileText className="size-5 text-primary-foreground" />;
}

// Draggable Page Item with specific drag controls
function DraggablePageItem({
  page,
  onDelete,
  onEdit,
  onStatusToggle,
  formatDate
}: {
  page: PageItem,
  onDelete: (id: string) => void,
  onEdit: (page: PageItem) => void,
  onStatusToggle: (page: PageItem) => void,
  formatDate: (d: string) => string
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={page}
      dragListener={false}
      dragControls={dragControls}
      className="bg-card"
    >
      <div className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors group">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Specific Drag Handle */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="cursor-grab p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
          >
            <Menu className="w-5 h-5" />
          </div>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center flex-shrink-0">
            <PageIconDisplay page={page} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {page.title}
            </h3>
            <div className="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
              <button
                onClick={() => onStatusToggle(page)}
                className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${page.isActive
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
              >
                {page.isActive ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Aktif
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Pasif
                  </>
                )}
              </button>
              <span>{page.path}</span>
              <span>• Sıra: {page.order}</span>
              {!page.showInNavigation && (
                <span className="text-amber-600">• Menüde Gizli</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-muted-foreground mr-2">
            {formatDate(page.updatedAt)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(page)}
            className="rounded-lg hover:bg-primary/10"
          >
            <Pencil className="size-4 text-muted-foreground" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(page._id)}
            className="rounded-lg hover:bg-red-100"
          >
            <Trash2 className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </Reorder.Item>
  );
}

// Static Page Item for non-search/filtered view
function PageListItem({
  page,
  onDelete,
  onEdit,
  onStatusToggle,
  formatDate,
  isDraggable
}: {
  page: PageItem,
  onDelete: (id: string) => void,
  onEdit: (page: PageItem) => void,
  onStatusToggle: (page: PageItem) => void,
  formatDate: (d: string) => string,
  isDraggable: boolean
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors group">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {isDraggable && (
          <div className="text-muted-foreground/50 p-1">
            {/* Disabled drag handle visual */}
            <Menu className="w-5 h-5" />
          </div>
        )}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center flex-shrink-0">
          <PageIconDisplay page={page} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {page.title}
          </h3>
          <div className="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
            <button
              onClick={() => onStatusToggle(page)}
              className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${page.isActive
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
            >
              {page.isActive ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Aktif
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Pasif
                </>
              )}
            </button>
            <span>{page.path}</span>
            {isDraggable && <span>• Sıra: {page.order}</span>}
            {!page.showInNavigation && (
              <span className="text-amber-600">• Menüde Gizli</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-muted-foreground mr-2">
          {formatDate(page.updatedAt)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onEdit(page)}
          className="rounded-lg hover:bg-primary/10"
        >
          <Pencil className="size-4 text-muted-foreground" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(page._id)}
          className="rounded-lg hover:bg-red-100"
        >
          <Trash2 className="size-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
