'use client';

/**
 * Hizmet listesinde kaydın yeni sitedeki durumu. Sitenin kendi birleştirme
 * kuralı (`mergeServices`) ile hesaplanır; böylece rozet sitede görüneni söyler.
 */
import { Badge } from '@/components/ui/badge';
import type { DisciplineId } from '@/content/fixral';
import { mergeServices, type FxService, type ServiceRowLike } from '@/content/fx-data';

export const DISCIPLINE_LABEL: Record<DisciplineId, string> = { muhendislik: 'Mühendislik', tasarim: 'Tasarım', uretim: 'Üretim' };

export type ServiceSiteStatus =
  | { kind: 'listed'; discipline: DisciplineId }
  /** Pasif ya da "Sitede göster" kapalı */
  | { kind: 'off' };

export interface ServiceSiteSummary {
  statuses: Record<string, ServiceSiteStatus>;
  site: FxService[];
}

export function computeServiceSite(rows: (ServiceRowLike & { _id?: string })[]): ServiceSiteSummary {
  const site = mergeServices(rows);
  const statuses: Record<string, ServiceSiteStatus> = {};
  for (const row of rows) {
    const id = row._id || row.id || '';
    const listed = site.find((s) => s.id === id);
    statuses[id] = listed ? { kind: 'listed', discipline: listed.discipline } : { kind: 'off' };
  }
  return { statuses, site };
}

export function ServiceSiteBadge({ status }: { status?: ServiceSiteStatus }) {
  if (!status) return null;
  if (status.kind === 'listed') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Badge variant="primary" className="rounded-full px-2 py-0 text-[10px]">Sitede</Badge>
        <span className="text-[11px] text-muted-foreground">{DISCIPLINE_LABEL[status.discipline]}</span>
      </span>
    );
  }
  return (
    <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-medium text-muted-foreground">Sitede değil</Badge>
  );
}
