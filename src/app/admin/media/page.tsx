'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Image as ImageIcon,
  CloudUpload,
  Search,
  Trash2,
  Eye,
  FileText,
  X,
  Folder,
  LayoutGrid,
  List,
  Video as VideoIcon,
  FolderTree as FolderTreeIcon,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageLayout } from '@/components/admin/admin-page-layout';
import MediaFolderTree, { MediaBreadcrumb } from '@/components/admin/MediaFolderTree';
import { buildFolderTree, filterItemsByFolder, MediaLibraryItem } from '@/lib/media-folders';

interface MediaItem extends MediaLibraryItem {
  name: string;
  type: string;
  createdAt: string;
}

// Yükleme API'sinin kabul ettiği bağlamlar; seçili klasör yolundan türetilir
const UPLOAD_CONTEXTS = ['general', 'portfolio', 'services', 'slider', 'about', 'logo', 'news', 'profile'];

function folderToUploadContext(folder: string | null): string {
  if (!folder) return 'general';
  const segments = folder.split('/').reverse();
  const match = segments.find((s) => UPLOAD_CONTEXTS.includes(s.toLowerCase()));
  return match ? match.toLowerCase() : 'general';
}

export default function AdminMediaPage() {
  const { status } = useSession();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'images' | 'videos' | 'documents'>('all');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showMobileTree, setShowMobileTree] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadMedia();
  }, [status, router]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/media');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.items;

      if (!Array.isArray(items)) {
        throw new Error(data?.error || 'Veri formatı hatalı (Liste bekleniyordu)');
      }

      const mappedData: MediaItem[] = items.map((item: any) => ({
        ...item,
        name: item.name || item.filename || 'İsimsiz',
        type: item.mimeType || item.type || 'application/octet-stream',
        url: item.url || '',
        size: item.size || 0,
        source: item.source || 'cloudinary',
        folder: item.folder || '',
        createdAt: item.createdAt || item.uploadedAt
      }));

      mappedData.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setMediaItems(mappedData);
    } catch (error: any) {
      console.error('Medya yüklenirken hata:', error);
      setError(error.message || 'Medya yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const folderTree = useMemo(() => buildFolderTree(mediaItems), [mediaItems]);

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item._id)));
    }
  };

  const handleDelete = async (itemIds: string[]) => {
    const confirmed = await confirm({ title: 'Emin misiniz?', description: `${itemIds.length} öğeyi silmek istediğinizden emin misiniz?` });
    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaIds: itemIds }),
      });

      if (response.ok) {
        setMediaItems(mediaItems.filter(item => !itemIds.includes(item._id)));
        setSelectedItems(new Set());
        if (previewItem && itemIds.includes(previewItem._id)) {
          setShowPreviewModal(false);
          setPreviewItem(null);
        }
        toast.success('Başarıyla silindi');
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        toast.error('Silme işlemi başarısız oldu: ' + (errorData.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Medya silinirken hata:', error);
      toast.error('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (item: MediaItem) => {
    setPreviewItem(item);
    setShowPreviewModal(true);
  };

  const handleFolderSelect = (folder: string | null) => {
    setSelectedFolder(folder);
    setSelectedItems(new Set());
    setShowMobileTree(false);
  };

  const filteredItems = useMemo(() => {
    const scoped = filterItemsByFolder(mediaItems, selectedFolder);
    return scoped.filter(item => {
      const itemName = item.name || '';
      const itemType = item.type || '';
      const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filter === 'all' ||
        (filter === 'images' && itemType.startsWith('image/')) ||
        (filter === 'videos' && itemType.startsWith('video/')) ||
        (filter === 'documents' && !itemType.startsWith('image/') && !itemType.startsWith('video/'));
      return matchesSearch && matchesFilter;
    });
  }, [mediaItems, selectedFolder, searchQuery, filter]);

  const formatFileSize = (bytes: number) => {
    if (!bytes && bytes !== 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Tarih yok';
    }
  };

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
        <div className="flex gap-6">
          <Skeleton className="hidden lg:block h-96 w-64 rounded-xl shrink-0" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminPageLayout
      title="Medya Kütüphanesi"
      description={`Toplam ${mediaItems.length} dosya, ${formatFileSize(mediaItems.reduce((acc, item) => acc + item.size, 0))}`}
      actions={
        <>
          {selectedItems.size > 0 && (
            <button
              onClick={() => handleDelete(Array.from(selectedItems))}
              className="hidden sm:inline-flex items-center px-4 py-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors font-medium"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              {selectedItems.size} Sil
            </button>
          )}
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-200"
          >
            <CloudUpload className="w-5 h-5 mr-2" />
            Dosya Yükle
          </button>
        </>
      }
    >
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-xl border border-destructive/20 p-4 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar: Folder Tree */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-4">
          <div className="bg-card rounded-xl shadow-sm border border-border p-3">
            <div className="flex items-center gap-2 px-2 pb-3 mb-2 border-b border-border">
              <FolderTreeIcon className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Klasörler</h3>
            </div>
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              <MediaFolderTree
                folders={folderTree}
                selectedFolder={selectedFolder}
                onSelect={handleFolderSelect}
                totalCount={mediaItems.length}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-4 sticky top-4 z-20 backdrop-blur-xl bg-card/90">
            <div className="flex flex-col xl:flex-row gap-4 justify-between xl:items-center">
              {/* Left: Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-1">
                {/* Mobile folder tree trigger */}
                <button
                  onClick={() => setShowMobileTree(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Folder className="w-4 h-4 text-amber-500/80" />
                  <span className="truncate">{selectedFolder ? selectedFolder.split('/').pop() : 'Tüm Dosyalar'}</span>
                  <span className="ml-auto px-1.5 py-0.5 bg-muted rounded-md text-[11px] font-semibold text-muted-foreground tabular-nums">
                    {filteredItems.length}
                  </span>
                </button>

                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Dosya ara..."
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-all"
                  />
                </div>

                <div className="flex items-center bg-muted p-1 rounded-xl shrink-0 overflow-x-auto max-w-full">
                  {(['all', 'images', 'videos', 'documents'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === f
                        ? 'bg-card text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                      {f === 'all' ? 'Tümü' : f === 'images' ? 'Görseller' : f === 'videos' ? 'Videolar' : 'Belgeler'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: View & Actions */}
              <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                <div className="flex items-center bg-muted p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Izgara Görünümü"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Liste Görünümü"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <div className="h-8 w-px bg-muted mx-1 hidden sm:block"></div>

                <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-primary border-border rounded focus:ring-ring transition-all"
                  />
                  <span className="text-sm font-medium text-foreground hidden sm:inline">Tümünü Seç</span>
                </label>
              </div>
            </div>

            {/* Breadcrumb + result info */}
            <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
              <MediaBreadcrumb folder={selectedFolder} onNavigate={handleFolderSelect} />
              <span className="text-xs text-muted-foreground font-medium tabular-nums">
                {filteredItems.length} dosya
              </span>
            </div>

            {/* Mobile Bulk Actions */}
            {selectedItems.size > 0 && (
              <div className="sm:hidden mt-4 pt-4 border-t border-border flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                <span className="text-sm font-medium text-muted-foreground">{selectedItems.size} seçildi</span>
                <button
                  onClick={() => handleDelete(Array.from(selectedItems))}
                  className="inline-flex items-center px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sil
                </button>
              </div>
            )}
          </div>

          {/* Content Area */}
          {filteredItems.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className={`group relative w-full bg-card rounded-xl shadow-sm border overflow-hidden cursor-pointer transition-all duration-200 ${selectedItems.has(item._id)
                      ? 'ring-2 ring-ring border-transparent shadow-primary/10'
                      : 'border-border hover:shadow-md hover:border-primary/50'
                      }`}
                    onClick={() => handleSelectItem(item._id)}
                  >
                    {/* Aspect Ratio Maintainer */}
                    <div className="pb-[100%]" />

                    <div className="absolute inset-0 w-full h-full">
                      <div className="w-full h-full relative">
                        {item.type.startsWith('image/') ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : item.type.startsWith('video/') ? (
                          <video
                            src={item.url}
                            className="absolute inset-0 w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 p-4 text-muted-foreground">
                            <FileText className="w-12 h-12 mb-2" />
                            <span className="text-xs text-center font-medium text-muted-foreground truncate w-full px-2 uppercase">
                              {item.format || item.type.split('/')[1] || 'Dosya'}
                            </span>
                          </div>
                        )}

                        {/* Overlay for Actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 z-20">
                          <p className="text-white text-xs font-medium truncate mb-2 drop-shadow-sm" title={item.name}>{item.name}</p>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(item);
                              }}
                              className="p-1.5 bg-white/15 backdrop-blur-md hover:bg-card text-white hover:text-foreground rounded-lg transition-all"
                              title="Önizle"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete([item._id]);
                              }}
                              className="p-1.5 bg-white/15 backdrop-blur-md hover:bg-destructive text-white hover:text-destructive-foreground rounded-lg transition-all"
                              title="Sil"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Checkbox */}
                      <div className={`absolute top-2 left-2 z-30 transition-all duration-200 ${selectedItems.has(item._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <div className="bg-card rounded-md shadow-sm p-0.5">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item._id)}
                            onChange={() => handleSelectItem(item._id)}
                            className="w-5 h-5 text-primary border-border rounded focus:ring-ring cursor-pointer block"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Type badge */}
                      {item.type.startsWith('video/') && (
                        <div className="absolute top-2 right-2 z-20 p-1 bg-black/50 rounded-md backdrop-blur-sm">
                          <VideoIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-muted-foreground">
                    <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                          />
                        </th>
                        <th className="px-4 py-3">Dosya</th>
                        <th className="px-4 py-3 hidden md:table-cell">Klasör</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Boyut</th>
                        <th className="px-4 py-3 hidden lg:table-cell">Tür</th>
                        <th className="px-4 py-3 hidden xl:table-cell">Tarih</th>
                        <th className="px-4 py-3 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredItems.map((item) => (
                        <tr
                          key={item._id}
                          className={`hover:bg-muted/50 transition-colors cursor-pointer ${selectedItems.has(item._id) ? 'bg-primary/5' : ''}`}
                          onClick={() => handleSelectItem(item._id)}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item._id)}
                              onChange={() => handleSelectItem(item._id)}
                              className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-muted shrink-0 overflow-hidden relative border border-border">
                                {item.type.startsWith('image/') ? (
                                  <Image src={item.url} alt={item.name} fill className="object-cover" />
                                ) : item.type.startsWith('video/') ? (
                                  <VideoIcon className="w-6 h-6 m-2 text-muted-foreground" />
                                ) : (
                                  <FileText className="w-6 h-6 m-2 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex flex-col max-w-[200px] sm:max-w-xs">
                                <span className="font-medium text-foreground truncate" title={item.name}>{item.name}</span>
                                <span className="text-xs text-muted-foreground sm:hidden">{formatFileSize(item.size)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {item.folder ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleFolderSelect(item.folder); }}
                                className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted/50 hover:bg-muted rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors max-w-[200px]"
                                title={item.folder}
                              >
                                <Folder className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
                                <span className="truncate">{item.folder}</span>
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground/60">Kök</span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">{formatFileSize(item.size)}</td>
                          <td className="px-4 py-3 hidden lg:table-cell font-mono text-xs">{item.type}</td>
                          <td className="px-4 py-3 hidden xl:table-cell whitespace-nowrap">{formatDate(item.createdAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePreview(item); }}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete([item._id]); }}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl shadow-sm border border-border border-dashed">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Medya bulunamadı</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                {searchQuery || filter !== 'all' || selectedFolder
                  ? 'Bu klasörde veya arama kriterlerinize uygun dosya bulunamadı.'
                  : 'Görsellerinizi ve dosyalarınızı buraya yükleyerek kütüphanenizi oluşturmaya başlayın.'
                }
              </p>
              {(!searchQuery && filter === 'all' && !selectedFolder) && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  <CloudUpload className="w-5 h-5 mr-2" />
                  Dosya Yükle
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Folder Tree Drawer */}
      {showMobileTree && (
        <div className="lg:hidden fixed inset-0 z-[9999] flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowMobileTree(false)} />
          <div className="relative w-80 max-w-[85vw] h-full bg-card border-r border-border shadow-2xl p-4 overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <FolderTreeIcon className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Klasörler</h3>
              </div>
              <button onClick={() => setShowMobileTree(false)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <MediaFolderTree
              folders={folderTree}
              selectedFolder={selectedFolder}
              onSelect={handleFolderSelect}
              totalCount={mediaItems.length}
            />
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-xl font-bold text-foreground">Dosya Yükle</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-amber-500/80" />
                  Hedef bağlam: <span className="font-mono font-medium text-foreground">{folderToUploadContext(selectedFolder)}</span>
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <label
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 hover:bg-primary/10 hover:border-primary transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CloudUpload className="w-8 h-8" />
                  </div>
                  <p className="mb-2 text-lg font-medium text-foreground">Tıklayın veya sürükleyin</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, GIF veya PDF (Maks. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setLoading(true);
                      setShowUploadModal(false);
                      const uploadContext = folderToUploadContext(selectedFolder);

                      try {
                        for (const file of Array.from(e.target.files)) {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('pageContext', uploadContext);
                          const res = await fetch('/api/admin/upload', {
                            method: 'POST',
                            body: formData
                          });
                          if (!res.ok) {
                            const errData = await res.json().catch(() => ({}));
                            toast.error(errData.error || `${file.name} yüklenemedi`);
                          }
                        }
                        await loadMedia();
                        toast.success('Yükleme tamamlandı');
                      } catch (err) {
                        console.error(err);
                        toast.error('Yükleme sırasında hata oluştu');
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewItem && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200" onClick={() => setShowPreviewModal(false)}>
          <div className="relative max-w-6xl w-full max-h-[90vh] flex flex-col md:flex-row gap-6 bg-transparent" onClick={e => e.stopPropagation()}>
            {/* Media Container */}
            <div className="flex-1 flex items-center justify-center bg-black/40 rounded-xl overflow-hidden relative group min-h-[300px]">
              {previewItem.type.startsWith('image/') ? (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img
                    src={previewItem.url}
                    alt={previewItem.name}
                    className="max-w-full max-h-[80vh] w-auto h-auto object-contain drop-shadow-2xl"
                  />
                </div>
              ) : previewItem.type.startsWith('video/') ? (
                <video
                  src={previewItem.url}
                  controls
                  className="max-w-full max-h-[80vh] rounded-lg"
                >
                  <track kind="captions" />
                </video>
              ) : (
                <div className="flex flex-col items-center text-white/80">
                  <FileText className="w-24 h-24 mb-4" />
                  <p className="text-xl font-medium">Önizleme yok</p>
                </div>
              )}
            </div>

            {/* Sidebar Details */}
            <div className="w-full md:w-80 bg-card rounded-xl shadow-2xl overflow-hidden shrink-0 flex flex-col">
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
                <h3 className="font-bold text-foreground truncate pr-4" title={previewItem.name}>{previewItem.name}</h3>
                <button onClick={() => setShowPreviewModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Klasör</label>
                    {previewItem.folder ? (
                      <button
                        onClick={() => {
                          setShowPreviewModal(false);
                          handleFolderSelect(previewItem.folder);
                        }}
                        className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 bg-muted/50 hover:bg-muted rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Folder className="w-3.5 h-3.5 text-amber-500/80" />
                        {previewItem.folder}
                      </button>
                    ) : (
                      <p className="text-sm font-medium text-foreground mt-1">Kök dizin</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dosya Türü</label>
                    <p className="text-sm font-medium text-foreground mt-1 font-mono bg-muted px-2 py-1 rounded w-fit">{previewItem.type}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Boyut</label>
                    <p className="text-sm font-medium text-foreground mt-1">{formatFileSize(previewItem.size)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Yükleme Tarihi</label>
                    <p className="text-sm font-medium text-foreground mt-1">{formatDate(previewItem.createdAt)}</p>
                  </div>
                  {previewItem.width && previewItem.height && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Boyutlar</label>
                      <p className="text-sm font-medium text-foreground mt-1">{previewItem.width} × {previewItem.height} px</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">URL</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        readOnly
                        value={previewItem.url}
                        className="text-xs bg-muted/50 border border-border rounded px-2 py-1.5 w-full text-muted-foreground"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(previewItem.url);
                          toast.success('URL kopyalandı');
                        }}
                        className="p-1.5 bg-primary/10 text-primary rounded hover:bg-primary/15 transition-colors"
                        title="Kopyala"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 border-t border-border">
                <button
                  onClick={() => {
                    handleDelete([previewItem._id]);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-destructive/10 text-destructive font-medium rounded-xl hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Dosyayı Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}
