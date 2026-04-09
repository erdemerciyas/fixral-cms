'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Tag,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { Skeleton } from '@/components/ui/skeleton';
import slugify from 'slugify';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
  createdAt: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
}

const emptyForm = (): CategoryFormData => ({
  name: '',
  slug: '',
  description: '',
});

export default function AdminCategoriesPage() {
  const { status } = useSession();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm());
  const [slugLocked, setSlugLocked] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }
    loadCategories();
  }, [status, router]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          ...item,
          count: item.count || 0,
        }));
        setCategories(mappedData);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm());
    setSlugLocked(true);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setSlugLocked(true);
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData(emptyForm());
    setFormErrors({});
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: slugLocked ? slugify(value, { lower: true, strict: true }) : prev.slug,
    }));
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Kategori adı zorunludur';
    if (!formData.slug.trim()) errs.slug = 'Slug zorunludur';
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const response = await fetch(`/api/admin/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Güncelleme başarısız');
        }
        toast.success('Kategori güncellendi');
      } else {
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Oluşturma başarısız');
        }
        toast.success('Kategori oluşturuldu');
      }
      closeModal();
      await loadCategories();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Bir hata oluştu';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    const confirmed = await confirm({
      title: 'Kategoriyi Sil',
      description: 'Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCategories(categories.filter((c) => c._id !== categoryId));
        toast.success('Kategori silindi');
      } else {
        toast.error('Kategori silinemedi');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Kategori silinirken hata oluştu');
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-foreground">Kategoriler</h1>
          <p className="text-muted-foreground mt-1">
            İçerik kategorilerinizi yönetin
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Kategori
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kategori ara..."
            className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-background"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <li
            key={category._id}
            className="bg-card rounded-xl shadow-sm border border-border/60 p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(category)}
                  className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-colors"
                  title="Düzenle"
                >
                  <Pencil className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {category.description}
              </p>
            )}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
              <span className="text-xs text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-lg">
                {category.count} içerik
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                /{category.slug}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-16 bg-card rounded-xl border border-border/60">
          <Tag className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Kategori bulunamadı
          </h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? 'Arama kriterlerinizi değiştirmeyi deneyin'
              : 'İlk kategorinizi oluşturarak içeriklerinizi düzenlemeye başlayın'}
          </p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">
                {editingId ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Kategori Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-background ${
                    formErrors.name ? 'border-red-400' : 'border-border'
                  }`}
                  placeholder="Kategori adı girin"
                  autoFocus
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  URL Slug
                </label>
                <div
                  className={`flex items-center border rounded-xl bg-muted/50 px-4 py-2.5 transition-colors ${
                    formErrors.slug
                      ? 'border-red-400'
                      : 'border-border focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent'
                  }`}
                >
                  <span className="text-muted-foreground text-sm mr-1">/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    readOnly={slugLocked}
                    className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0 focus:outline-none"
                    placeholder="otomatik-olusturulur"
                  />
                  <button
                    type="button"
                    onClick={() => setSlugLocked(!slugLocked)}
                    className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {slugLocked ? (
                      <Pencil className="w-3.5 h-3.5" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {formErrors.slug && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.slug}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Açıklama
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-background resize-none"
                  placeholder="Kategori açıklaması (isteğe bağlı)"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {editingId ? 'Güncelle' : 'Oluştur'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
