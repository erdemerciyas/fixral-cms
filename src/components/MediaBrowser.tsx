'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Spinner } from './ui/spinner';
import {
  X as XMarkIcon,
  Image as PhotoIcon,
  Search as MagnifyingGlassIcon,
  Upload as ArrowUpTrayIcon,
  Trash2 as TrashIcon,
  Eye as EyeIcon,
  CheckCircle as CheckCircleIconSolid,
  FileText,
  Video as VideoIcon,
  FolderTree as FolderTreeIcon,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import MediaFolderTree, { MediaBreadcrumb } from './admin/MediaFolderTree';
import { buildFolderTree, filterItemsByFolder, MediaLibraryItem } from '@/lib/media-folders';

type MediaItem = MediaLibraryItem;

interface MediaBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string | string[]) => void;
  onUploadNew: () => void;
  title?: string;
  allowedTypes?: string[];
  theme?: 'dark' | 'light'; // Kept for compatibility
  pageContext?: string;
  allowMultipleSelect?: boolean;
  variant?: 'fullscreen' | 'dialog';
  enableInlineUpload?: boolean;
}

// Yükleme API'sinin kabul ettiği bağlamlar; seçili klasör yolundan türetilir
const UPLOAD_CONTEXTS = ['general', 'portfolio', 'services', 'slider', 'about', 'logo', 'news', 'profile'];

function folderToUploadContext(folder: string | null): string {
  if (!folder) return 'general';
  const segments = folder.split('/').reverse();
  const match = segments.find((s) => UPLOAD_CONTEXTS.includes(s.toLowerCase()));
  return match ? match.toLowerCase() : 'general';
}

const MediaBrowser: React.FC<MediaBrowserProps> = ({
  isOpen,
  onClose,
  onSelect,
  onUploadNew,
  title = 'Medya Seç',
  allowedTypes = ['image/'],
  pageContext = 'general',
  allowMultipleSelect = false,
  variant = 'fullscreen',
  enableInlineUpload = false
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const initialFolderApplied = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mount flag
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Modal dışı tıklama ile kapatma
  useEffect(() => {
    if (!isOpen) return;
    if (previewItem) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // "Yeni Yükle" butonuna tıklandıysa kapatma
      if (target.closest('.upload-btn')) {
        return;
      }

      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, previewItem]);

  // Seçim işlemi
  const handleConfirmSelection = useCallback(() => {
    if (allowMultipleSelect && selectedItems.length > 0) {
      const urls = selectedItems
        .map(id => mediaItems.find(item => item._id === id)?.url)
        .filter((url): url is string => url !== undefined && isValidUrl(url));

      if (urls.length > 0) {
        onSelect(urls);
        onClose();
      }
    } else if (selectedItem) {
      const item = mediaItems.find(item => item._id === selectedItem);
      if (item && isValidUrl(item.url)) {
        onSelect(item.url);
        onClose();
      }
    }
  }, [allowMultipleSelect, selectedItems, mediaItems, selectedItem, onSelect, onClose]);

  // Klavye kısayolları
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewItem) setPreviewItem(null);
        else onClose();
      } else if (e.key === 'Enter' && !previewItem) {
        e.preventDefault();
        handleConfirmSelection();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, handleConfirmSelection, onClose, previewItem]);

  const isValidUrl = (url: string): boolean => {
    return Boolean(url && (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')));
  };

  const fetchMediaItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/media');
      if (response.ok) {
        const data = await response.json();
        const items: MediaItem[] = (Array.isArray(data) ? data : data.items || []).map((item: any) => ({
          ...item,
          folder: item.folder || '',
        }));
        setMediaItems(items);
      }
    } catch (error) {
      console.error('Media fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchMediaItems();
    } else {
      initialFolderApplied.current = false;
    }
  }, [isOpen, fetchMediaItems]);

  const folderTree = useMemo(() => buildFolderTree(mediaItems), [mediaItems]);

  // pageContext'e karşılık gelen klasörü ilk açılışta seç (örn. "portfolio" -> "fixral/portfolio")
  useEffect(() => {
    if (!isOpen || initialFolderApplied.current || mediaItems.length === 0) return;
    initialFolderApplied.current = true;

    if (!pageContext || pageContext === 'general' || pageContext === 'all') return;

    const candidates = [pageContext.toLowerCase(), `${pageContext.toLowerCase()}s`];
    const match = mediaItems
      .map(item => item.folder)
      .find(folder => {
        const last = folder.split('/').pop()?.toLowerCase();
        return last !== undefined && candidates.includes(last);
      });

    if (match) setSelectedFolder(match);
  }, [isOpen, mediaItems, pageContext]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    // Seçili klasörden yükleme bağlamı türet
    formData.append('pageContext', folderToUploadContext(selectedFolder));

    setLoading(true);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        // Yeni öğe klasör bilgisiyle listeye eklensin diye tam listeyi yenile
        await fetchMediaItems();
        if (!allowMultipleSelect && data.publicId) {
          setSelectedItem(data.publicId);
        }
      } else {
        alert(data.error || 'Dosya yüklenemedi.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Dosya yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getFilteredItems = () => {
    let filtered = filterItemsByFolder(mediaItems, selectedFolder).filter(item => {
      if (!isValidUrl(item.url)) return false;
      const typeAllowed = allowedTypes.some(type => item.mimeType.startsWith(type));
      if (!typeAllowed) return false;
      if (searchTerm) {
        return item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.filename.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });

    if (filter === 'images') {
      filtered = filtered.filter(item => item.mimeType.startsWith('image/'));
    } else if (filter === 'videos') {
      filtered = filtered.filter(item => item.mimeType.startsWith('video/'));
    } else if (filter === 'documents') {
      filtered = filtered.filter(item =>
        !item.mimeType.startsWith('image/') && !item.mimeType.startsWith('video/')
      );
    }

    return filtered.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleItemClick = (itemId: string) => {
    if (allowMultipleSelect) {
      setSelectedItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setSelectedItem(prev => prev === itemId ? null : itemId);
    }
  };

  const handleFolderSelect = (folder: string | null) => {
    setSelectedFolder(folder);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Bu görseli kalıcı olarak silmek istediğinize emin misiniz?')) return;

    try {
      setLoading(true);
      const encodedId = encodeURIComponent(itemId);
      const response = await fetch(`/api/admin/media/${encodedId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMediaItems(items => items.filter(item => item._id !== itemId));
        if (selectedItem === itemId) setSelectedItem(null);
        setSelectedItems(items => items.filter(id => id !== itemId));
        if (previewItem?._id === itemId) setPreviewItem(null);
      } else {
        alert(data.error || 'Silme işlemi başarısız oldu.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme işlemi sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !isMounted) return null;

  const filteredItems = getFilteredItems();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept={allowedTypes.map(t => t.endsWith('/') ? t + '*' : t).join(',')}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`
          relative w-full bg-card text-foreground rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border
          ${variant === 'fullscreen' ? 'h-[90vh] max-w-[1400px]' : 'h-[80vh] max-w-5xl'}
        `}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card/80 backdrop-blur z-10 sticky top-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <PhotoIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground leading-tight">{title}</h3>
              <p className="text-sm text-muted-foreground">Kütüphaneden seçim yapın</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 md:flex-initial md:min-w-[420px]">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Dosya ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-all placeholder:text-muted-foreground"
              />
            </div>

            {/* Type Filter */}
            <div className="hidden sm:flex items-center bg-muted p-1 rounded-xl shrink-0">
              {(['all', 'images', 'videos', 'documents'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${filter === f
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {f === 'all' ? 'Tümü' : f === 'images' ? 'Görsel' : f === 'videos' ? 'Video' : 'Belge'}
                </button>
              ))}
            </div>

            <div className="w-px h-8 bg-border mx-1 hidden md:block" />

            {/* Actions */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (enableInlineUpload) {
                  fileInputRef.current?.click();
                } else {
                  onUploadNew();
                }
              }}
              className="upload-btn flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-sm hover:shadow-md hover:shadow-primary/20"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Yükle</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body: Sidebar + Grid */}
        <div className="flex-1 flex min-h-0">
          {/* Folder Tree Sidebar */}
          {showSidebar && (
            <aside className="hidden md:flex w-60 shrink-0 border-r border-border bg-muted/30 flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <FolderTreeIcon className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Klasörler</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <MediaFolderTree
                  folders={folderTree}
                  selectedFolder={selectedFolder}
                  onSelect={handleFolderSelect}
                  totalCount={mediaItems.length}
                />
              </div>
            </aside>
          )}

          {/* Content Column */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Breadcrumb bar */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
              <button
                type="button"
                onClick={() => setShowSidebar(prev => !prev)}
                className="hidden md:inline-flex p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                title={showSidebar ? 'Klasör panelini gizle' : 'Klasör panelini göster'}
              >
                {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </button>
              <MediaBreadcrumb folder={selectedFolder} onNavigate={handleFolderSelect} className="flex-1" />
              <span className="text-xs text-muted-foreground font-medium tabular-nums shrink-0">
                {filteredItems.length} dosya
              </span>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto bg-muted/20 p-4 custom-scrollbar">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Spinner text="Medya kütüphanesi yükleniyor..." />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                    <PhotoIcon className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Dosya bulunamadı</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-1 mb-6">
                    {searchTerm
                      ? `"${searchTerm}" aramasına uygun sonuç yok.`
                      : 'Bu klasörde dosya yok veya kütüphane boş.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => enableInlineUpload ? fileInputRef.current?.click() : onUploadNew()}
                    className="upload-btn px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-colors shadow-sm"
                  >
                    İlk Dosyayı Yükle
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {filteredItems.map((item) => {
                    const isSelected = allowMultipleSelect
                      ? selectedItems.includes(item._id)
                      : selectedItem === item._id;

                    return (
                      <div
                        key={item._id}
                        onClick={() => handleItemClick(item._id)}
                        className={`
                          group relative aspect-square bg-card rounded-xl overflow-hidden cursor-pointer border transition-all duration-200
                          ${isSelected
                            ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                            : 'border-border hover:border-primary/50 hover:shadow-md'}
                        `}
                      >
                        {/* Selection Badge */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 z-20 bg-card rounded-full text-primary shadow-sm animate-in zoom-in duration-200">
                            <CheckCircleIconSolid className="w-6 h-6" />
                          </div>
                        )}

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                            className="p-2 bg-card/90 rounded-full text-foreground hover:text-primary transition-colors shadow-sm hover:scale-110"
                            title="Önizle"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                            className="p-2 bg-card/90 rounded-full text-foreground hover:text-destructive transition-colors shadow-sm hover:scale-110"
                            title="Sil"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Image/File Preview */}
                        <div className="w-full h-full p-2">
                          <div className="w-full h-full relative rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            {item.mimeType.startsWith('image/') && item.url ? (
                              <img
                                src={item.url}
                                alt={item.originalName}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : item.mimeType.startsWith('video/') ? (
                              <VideoIcon className="w-10 h-10 text-muted-foreground" />
                            ) : (
                              <FileText className="w-10 h-10 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Info Overlay (Bottom) */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                          <p className="text-white text-xs font-medium truncate drop-shadow-sm">
                            {item.originalName}
                          </p>
                          <p className="text-white/80 text-[10px] truncate">
                            {formatFileSize(item.size)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-card flex items-center justify-between gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">{filteredItems.length} dosya gösteriliyor</span>
            {allowMultipleSelect && selectedItems.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-md font-medium">
                {selectedItems.length} seçildi
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground font-medium hover:bg-muted rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={allowMultipleSelect ? selectedItems.length === 0 : !selectedItem}
              className={`
                px-6 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all
                ${(allowMultipleSelect ? selectedItems.length > 0 : selectedItem)
                  ? 'bg-primary text-primary-foreground hover:opacity-90 hover:shadow-md hover:shadow-primary/20'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'}
              `}
            >
              Seçimi Onayla
            </button>
          </div>
        </div>

        {/* Preview Modal */}
        {previewItem && (
          <div className="absolute inset-0 z-50 bg-card/95 backdrop-blur flex flex-col items-center justify-center p-8 animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-muted-foreground" />
            </button>

            <div className="w-full max-w-4xl h-[65vh] flex items-center justify-center mb-6">
              {previewItem.mimeType.startsWith('image/') ? (
                <img
                  src={previewItem.url}
                  alt={previewItem.originalName}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              ) : previewItem.mimeType.startsWith('video/') ? (
                <video src={previewItem.url} controls className="max-w-full max-h-full rounded-lg shadow-2xl">
                  <track kind="captions" />
                </video>
              ) : (
                <div className="w-64 h-64 bg-muted rounded-2xl flex items-center justify-center">
                  <FileText className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="text-center">
              <h4 className="text-xl font-bold text-foreground mb-1">{previewItem.originalName}</h4>
              <p className="text-muted-foreground">
                {previewItem.folder && <span className="font-mono text-xs mr-2">{previewItem.folder}/</span>}
                {formatFileSize(previewItem.size)} • {new Date(previewItem.uploadedAt).toLocaleDateString('tr-TR')}
              </p>

              <button
                type="button"
                onClick={() => {
                  handleItemClick(previewItem._id);
                  setPreviewItem(null);
                }}
                className="mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
              >
                Bu Dosyayı Seç
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaBrowser;
