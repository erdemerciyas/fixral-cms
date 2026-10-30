'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Reorder, useDragControls } from 'framer-motion';
import { Box, Pencil, Trash2, GripVertical } from 'lucide-react';

export interface ReorderableService {
  _id: string;
  title: string;
  status: 'published' | 'draft';
  image?: string;
  createdAt: string;
}

interface ServiceReorderListProps<T extends ReorderableService> {
  services: T[];
  onReorder: (items: T[]) => void;
  onDelete: (id: string) => void;
  formatDate: (d: string) => string;
  /** Durum rozetinin yanına ek rozet (ör. yeni sitedeki durum) */
  renderBadge?: (service: T) => ReactNode;
}

export default function ServiceReorderList<T extends ReorderableService>({
  services,
  onReorder,
  onDelete,
  formatDate,
  renderBadge,
}: ServiceReorderListProps<T>) {
  return (
    <Reorder.Group axis="y" values={services} onReorder={onReorder} className="divide-y divide-border">
      {services.map((service, index) => (
        <DraggableServiceItem
          key={service._id}
          service={service}
          index={index}
          onDelete={onDelete}
          formatDate={formatDate}
          badge={renderBadge?.(service)}
        />
      ))}
    </Reorder.Group>
  );
}

function DraggableServiceItem({
  service,
  index,
  onDelete,
  formatDate,
  badge,
}: {
  service: ReorderableService;
  index: number;
  onDelete: (id: string) => void;
  formatDate: (d: string) => string;
  badge?: ReactNode;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={service}
      dragListener={false}
      dragControls={dragControls}
      className="bg-card"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-muted/50 transition-colors group">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="cursor-grab p-1.5 text-muted-foreground hover:text-foreground active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          <span className="w-7 h-7 rounded-lg bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>

          <div className="w-12 h-12 bg-muted rounded-xl overflow-hidden shrink-0 border border-border flex items-center justify-center">
            {service.image ? (
              <img src={service.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <Box className="w-5 h-5 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {service.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
                ${service.status === 'published'
                  ? 'bg-success/15 text-success'
                  : 'bg-warning/15 text-warning'}
              `}>
                {service.status === 'published' ? 'Yayında' : 'Taslak'}
              </span>
              {badge}
              <span className="text-xs text-muted-foreground hidden sm:inline">{formatDate(service.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Link
            href={`/admin/services/edit/${service._id}`}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Düzenle"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(service._id)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}
