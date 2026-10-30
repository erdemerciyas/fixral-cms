'use client';

/**
 * Panel → Videolar: YouTube videoları (VideoRow).
 * Durumlar: visible (Yayında, sitede görünür) · draft (Taslak) · hidden (Pasif).
 * Toplu seçimle yayınla / taslağa al / pasif yap / sil; tekil düzenleme ve ekleme formu.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ExternalLink, Eye, EyeOff, FilePen, Loader2, Pencil, Plus, Search, Trash2, Video as VideoIcon, X } from 'lucide-react';
import { AdminPageLayout } from '@/components/admin/admin-page-layout';
import { ListPageSkeleton } from '@/components/admin/admin-skeletons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useConfirm } from '@/hooks/use-confirm';
import { cn } from '@/lib/utils';

type VideoStatus = 'visible' | 'draft' | 'hidden';
type VideoType = 'normal' | 'short';

interface Video {
  _id: string;
  videoId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  publishedAt?: string | null;
  type: VideoType;
  status: VideoStatus;
  tags?: string[];
}

const STATUS: Record<VideoStatus, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  visible: { label: 'Yayında', variant: 'success' },
  draft: { label: 'Taslak', variant: 'warning' },
  hidden: { label: 'Pasif', variant: 'secondary' },
};

const SELECT_CLASS = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring';

const formatDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

/** YouTube bağlantısından ya da doğrudan kimlikten 11 karakterlik video kimliği */
function parseVideoId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export default function AdminVideosPage() {
  const { status } = useSession();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VideoStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | VideoType>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  /** Düzenlenen video; 'new' yeni kayıt, null kapalı */
  const [editing, setEditing] = useState<Video | 'new' | null>(null);

  const loadVideos = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/videos', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      setVideos(await res.json());
    } catch {
      toast.error('Videolar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/admin/login'); return; }
    if (status === 'authenticated') void Promise.resolve().then(loadVideos);
  }, [status, router, loadVideos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    return videos.filter((v) =>
      (statusFilter === 'all' || v.status === statusFilter) &&
      (typeFilter === 'all' || v.type === typeFilter) &&
      (!q || `${v.title} ${v.description ?? ''} ${(v.tags ?? []).join(' ')}`.toLocaleLowerCase('tr').includes(q)),
    );
  }, [videos, query, statusFilter, typeFilter]);

  const counts = useMemo(() => ({
    all: videos.length,
    visible: videos.filter((v) => v.status === 'visible').length,
    draft: videos.filter((v) => v.status === 'draft').length,
    hidden: videos.filter((v) => v.status === 'hidden').length,
  }), [videos]);

  const allShownSelected = filtered.length > 0 && filtered.every((v) => selected.has(v._id));
  const someShownSelected = filtered.some((v) => selected.has(v._id));

  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const toggleAllShown = () => setSelected((prev) => {
    const next = new Set(prev);
    filtered.forEach((v) => (allShownSelected ? next.delete(v._id) : next.add(v._id)));
    return next;
  });

  const setStatusFor = async (ids: string[], next: VideoStatus) => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/videos/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIds: ids, status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      const set = new Set(ids);
      setVideos((list) => list.map((v) => (set.has(v._id) ? { ...v, status: next } : v)));
      setSelected(new Set());
      toast.success(`${ids.length} video: ${STATUS[next].label}`);
    } catch (e) {
      toast.error('Durum güncellenemedi', { description: e instanceof Error ? e.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (ids: string[]) => {
    const names = videos.filter((v) => ids.includes(v._id)).map((v) => v.title);
    const ok = await confirm({
      title: ids.length === 1 ? `"${names[0]}" silinsin mi?` : `${ids.length} video silinsin mi?`,
      description: 'Videolar panelden ve siteden kaldırılır; YouTube kanalındaki videolar etkilenmez. Bu işlem geri alınamaz.',
      confirmText: 'Sil',
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/videos/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIds: ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      const set = new Set(ids);
      setVideos((list) => list.filter((v) => !set.has(v._id)));
      setSelected((prev) => new Set([...prev].filter((id) => !set.has(id))));
      toast.success(`${data.deletedCount ?? ids.length} video silindi`);
    } catch (e) {
      toast.error('Silinemedi', { description: e instanceof Error ? e.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  const onSaved = (video: Video, isNew: boolean) => {
    setVideos((list) => (isNew ? [video, ...list] : list.map((v) => (v._id === video._id ? video : v))));
    setEditing(null);
  };

  if (status === 'loading' || loading) return <ListPageSkeleton />;

  const selectedIds = [...selected];

  return (
    <AdminPageLayout
      title="Videolar"
      description="YouTube videoları. Yalnızca “Yayında” olanlar sitede görünür; taslak ve pasif videolar gizlidir."
      actions={
        <>
          <Button asChild variant="ghost" size="sm">
            <a href="https://www.youtube.com/@fixral/videos" target="_blank" rel="noopener noreferrer"><ExternalLink /> Kanal<span className="sr-only"> (yeni sekmede açılır)</span></a>
          </Button>
          <Button size="sm" onClick={() => setEditing('new')}><Plus /> Video ekle</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1" role="group" aria-label="Duruma göre filtre">
          {(['all', 'visible', 'draft', 'hidden'] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={statusFilter === k}
              onClick={() => setStatusFilter(k)}
              className={cn('rounded-md px-3 py-1.5 text-sm font-medium transition-colors', statusFilter === k ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}
            >
              {k === 'all' ? 'Tümü' : STATUS[k].label} <span className="tabular-nums text-muted-foreground">({counts[k]})</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Başlık, açıklama ya da etiket" aria-label="Videolarda ara" className="pl-9" />
          </div>
          <select className={cn(SELECT_CLASS, 'sm:w-36')} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | VideoType)} aria-label="Türe göre filtre">
            <option value="all">Tüm türler</option>
            <option value="normal">Video</option>
            <option value="short">Kısa</option>
          </select>
        </div>
      </div>

      {/* Toplu işlem çubuğu */}
      <div className={cn('flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2', selected.size > 0 ? 'border-primary/40 bg-primary/5' : 'bg-card')}>
        <div className="mr-auto flex items-center gap-2">
          <Checkbox
            id="video-select-all"
            checked={allShownSelected ? true : someShownSelected ? 'indeterminate' : false}
            onCheckedChange={toggleAllShown}
            disabled={filtered.length === 0}
          />
          <label htmlFor="video-select-all" className="cursor-pointer text-sm">
            {selected.size > 0 ? <><b className="tabular-nums">{selected.size}</b> video seçildi</> : `Listelenen ${filtered.length} videonun tümünü seç`}
          </label>
        </div>
        {selected.size > 0 && (
          <>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void setStatusFor(selectedIds, 'visible')}><Eye /> Yayınla</Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void setStatusFor(selectedIds, 'draft')}><FilePen /> Taslağa al</Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void setStatusFor(selectedIds, 'hidden')}><EyeOff /> Pasif yap</Button>
            <Button size="sm" variant="outline" disabled={busy} className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => void remove(selectedIds)}><Trash2 /> Sil</Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setSelected(new Set())}><X /> Seçimi temizle</Button>
            {busy && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="İşleniyor" />}
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <VideoIcon className="size-10 text-muted-foreground/50" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{videos.length ? 'Filtreyle eşleşen video yok.' : 'Henüz video yok.'}</p>
          {!videos.length && <Button onClick={() => setEditing('new')}><Plus /> Video ekle</Button>}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" aria-label="Videolar">
          {filtered.map((v) => {
            const isSel = selected.has(v._id);
            const st = STATUS[v.status] ?? STATUS.hidden;
            return (
              <li key={v._id} className={cn('flex flex-col overflow-hidden rounded-xl border bg-card transition-colors', isSel && 'border-primary ring-1 ring-primary', v.status !== 'visible' && !isSel && 'border-dashed')}>
                <div className="relative aspect-video bg-muted">
                  {v.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element -- YouTube küçük resmi; panelde optimizasyon gerekmez
                    <img src={v.thumbnail} alt="" loading="lazy" className={cn('size-full object-cover', v.status !== 'visible' && 'opacity-60')} />
                  ) : (
                    <div className="flex size-full items-center justify-center"><VideoIcon className="size-10 text-muted-foreground/50" aria-hidden="true" /></div>
                  )}
                  <div className="absolute left-2 top-2 rounded-md bg-background/90 p-1 shadow-xs">
                    <Checkbox checked={isSel} onCheckedChange={() => toggle(v._id)} aria-label={`${v.title}: seç`} />
                  </div>
                  <div className="absolute right-2 top-2 flex gap-1">
                    {v.type === 'short' && <Badge variant="info">Kısa</Badge>}
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h2 className="line-clamp-2 text-sm font-semibold leading-snug">{v.title}</h2>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{v.description || <span className="italic">Açıklama yok</span>}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="text-xs tabular-nums text-muted-foreground">{formatDate(v.publishedAt)}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => setEditing(v)} aria-label={`${v.title}: düzenle`}><Pencil /> Düzenle</Button>
                      <Button asChild variant="ghost" size="icon" className="size-8">
                        <a href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer" aria-label={`${v.title}: YouTube'da aç (yeni sekmede)`}><ExternalLink /></a>
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" disabled={busy} onClick={() => void remove([v._id])} aria-label={`${v.title}: sil`}><Trash2 /></Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <VideoEditor video={editing} onClose={() => setEditing(null)} onSaved={onSaved} />
    </AdminPageLayout>
  );
}

/* ---------------------------------------------------------------- Düzenleme / ekleme */

interface Draft { link: string; title: string; description: string; type: VideoType; status: VideoStatus; tags: string; publishedAt: string }

const toDraft = (v: Video | 'new'): Draft => (v === 'new'
  ? { link: '', title: '', description: '', type: 'normal', status: 'draft', tags: '', publishedAt: new Date().toISOString().slice(0, 10) }
  : { link: `https://www.youtube.com/watch?v=${v.videoId}`, title: v.title, description: v.description ?? '', type: v.type, status: v.status, tags: (v.tags ?? []).join(', '), publishedAt: v.publishedAt ? v.publishedAt.slice(0, 10) : '' });

function VideoEditor({ video, onClose, onSaved }: { video: Video | 'new' | null; onClose: () => void; onSaved: (v: Video, isNew: boolean) => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastVideo, setLastVideo] = useState(video);
  // Açılan kayıt değişince formu yeniden doldur (render sırasında; efekt gerekmez)
  if (video !== lastVideo) {
    setLastVideo(video);
    setDraft(video ? toDraft(video) : null);
  }

  const isNew = video === 'new';
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const save = async () => {
    if (!draft || !video) return;
    const title = draft.title.trim();
    if (!title) { toast.error('Başlık gerekli'); return; }
    const payload = {
      title,
      description: draft.description,
      type: draft.type,
      status: draft.status,
      tags: draft.tags.split(',').map((t) => t.trim()).filter(Boolean),
      publishedAt: draft.publishedAt ? new Date(`${draft.publishedAt}T12:00:00Z`).toISOString() : null,
    };
    let body: Record<string, unknown> = payload;
    if (isNew) {
      const videoId = parseVideoId(draft.link);
      if (!videoId) { toast.error('Geçerli bir YouTube bağlantısı girin'); return; }
      body = { ...payload, videoId, thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`, channelName: 'FIXRAL', channelUrl: 'https://www.youtube.com/@fixral' };
    }
    setSaving(true);
    try {
      const res = await fetch(isNew ? '/api/admin/videos' : `/api/admin/videos/${video._id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error === 'Video already exists' ? 'Bu video zaten listede' : data.error);
      onSaved(data as Video, isNew);
      toast.success(isNew ? 'Video eklendi' : 'Video güncellendi');
    } catch (e) {
      toast.error('Kaydedilemedi', { description: e instanceof Error ? e.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!video} onOpenChange={(o) => { if (!o && !saving) onClose(); }}>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Video ekle' : 'Videoyu düzenle'}</DialogTitle>
          <DialogDescription>Başlık ve açıklama yalnızca sitede değişir; YouTube&apos;daki video etkilenmez.</DialogDescription>
        </DialogHeader>
        {draft && (
          <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); void save(); }}>
            <div className="grid gap-1.5">
              <Label htmlFor="video-link">YouTube bağlantısı</Label>
              <Input id="video-link" value={draft.link} onChange={(e) => set('link', e.target.value)} readOnly={!isNew} placeholder="https://www.youtube.com/watch?v=…" className={cn(!isNew && 'text-muted-foreground')} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="video-title">Başlık</Label>
              <Input id="video-title" value={draft.title} onChange={(e) => set('title', e.target.value)} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="video-desc">Açıklama</Label>
              <Textarea id="video-desc" rows={6} value={draft.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="video-status">Durum</Label>
                <select id="video-status" className={SELECT_CLASS} value={draft.status} onChange={(e) => set('status', e.target.value as VideoStatus)}>
                  <option value="visible">Yayında</option>
                  <option value="draft">Taslak</option>
                  <option value="hidden">Pasif</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="video-type">Tür</Label>
                <select id="video-type" className={SELECT_CLASS} value={draft.type} onChange={(e) => set('type', e.target.value as VideoType)}>
                  <option value="normal">Video</option>
                  <option value="short">Kısa</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="video-date">Yayın tarihi</Label>
                <Input id="video-date" type="date" value={draft.publishedAt} onChange={(e) => set('publishedAt', e.target.value)} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="video-tags">Etiketler</Label>
              <Input id="video-tags" value={draft.tags} onChange={(e) => set('tags', e.target.value)} placeholder="cnc, 3d baskı, otomotiv" />
              <p className="text-xs text-muted-foreground">Virgülle ayırın; sitedeki etiket filtresinde kullanılır.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>Vazgeç</Button>
              <Button type="submit" disabled={saving}>{saving && <Loader2 className="animate-spin" />} {isNew ? 'Ekle' : 'Kaydet'}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
