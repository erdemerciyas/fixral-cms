'use client';

// Medya kütüphanesi için file-manager tarzı klasör ağacı.
// Admin medya sayfası ve MediaBrowser seçicisinde ortak kullanılır.

import React, { useCallback, useEffect, useState } from 'react';
import { ChevronRight, Folder, FolderOpen, HardDrive } from 'lucide-react';
import { MediaFolderNode, folderToBreadcrumbs } from '@/lib/media-folders';

interface MediaBreadcrumbProps {
  folder: string | null;
  onNavigate: (folder: string | null) => void;
  className?: string;
}

/** Seçili klasör yolu için tıklanabilir breadcrumb navigasyonu. */
export function MediaBreadcrumb({ folder, onNavigate, className = '' }: MediaBreadcrumbProps) {
  const crumbs = folderToBreadcrumbs(folder);

  return (
    <nav aria-label="Klasör yolu" className={`flex items-center gap-1 flex-wrap text-sm min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => onNavigate(null)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
          folder === null
            ? 'text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        <HardDrive className="w-3.5 h-3.5" />
        Tüm Dosyalar
      </button>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={crumb.path}>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
            <button
              type="button"
              onClick={() => onNavigate(crumb.path)}
              disabled={isLast}
              className={`px-2 py-1 rounded-md truncate max-w-[160px] transition-colors ${
                isLast
                  ? 'text-foreground font-medium cursor-default'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={crumb.path}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

interface MediaFolderTreeProps {
  folders: MediaFolderNode[];
  /** null = tüm dosyalar */
  selectedFolder: string | null;
  onSelect: (folder: string | null) => void;
  totalCount: number;
  className?: string;
}

interface FolderRowProps {
  node: MediaFolderNode;
  depth: number;
  selectedFolder: string | null;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onSelect: (folder: string | null) => void;
}

// Derinliğe göre girinti sınıfları (inline style yerine)
const DEPTH_PADDING = ['pl-1.5', 'pl-[22px]', 'pl-[38px]', 'pl-[54px]', 'pl-[70px]', 'pl-[86px]'];

function FolderRow({ node, depth, selectedFolder, expanded, onToggle, onSelect }: FolderRowProps) {
  const isSelected = selectedFolder === node.path;
  const isExpanded = expanded.has(node.path);
  const hasChildren = node.children.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(node.path);
    } else if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
      e.preventDefault();
      onToggle(node.path);
    } else if (e.key === 'ArrowLeft' && hasChildren && isExpanded) {
      e.preventDefault();
      onToggle(node.path);
    }
  };

  return (
    <div>
      <div
        role="treeitem"
        tabIndex={0}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        onClick={() => onSelect(node.path)}
        onKeyDown={handleKeyDown}
        className={`group flex items-center gap-1.5 pr-2 py-1.5 rounded-lg cursor-pointer select-none transition-colors text-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ${
          DEPTH_PADDING[Math.min(depth, DEPTH_PADDING.length - 1)]
        } ${
          isSelected
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-foreground/80 hover:bg-muted hover:text-foreground'
        }`}
      >
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(node.path);
          }}
          className={`w-5 h-5 shrink-0 flex items-center justify-center rounded transition-colors ${
            hasChildren ? 'hover:bg-muted-foreground/10 text-muted-foreground' : 'text-transparent pointer-events-none'
          }`}
          aria-label={isExpanded ? 'Daralt' : 'Genişlet'}
        >
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </button>

        {isExpanded && hasChildren ? (
          <FolderOpen className={`w-4 h-4 shrink-0 ${isSelected ? 'text-primary' : 'text-amber-500/80'}`} />
        ) : (
          <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-primary' : 'text-amber-500/80'}`} />
        )}

        <span className="truncate flex-1" title={node.path}>
          {node.name}
        </span>

        <span
          className={`shrink-0 min-w-6 text-center px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${
            isSelected ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-muted-foreground/10'
          }`}
          title={`${node.directCount} dosya bu klasörde, toplam ${node.totalCount}`}
        >
          {node.totalCount}
        </span>
      </div>

      {hasChildren && isExpanded && (
        <div role="group">
          {node.children.map((child) => (
            <FolderRow
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedFolder={selectedFolder}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MediaFolderTree({
  folders,
  selectedFolder,
  onSelect,
  totalCount,
  className = '',
}: MediaFolderTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Seçili klasörün üst dallarını otomatik aç
  useEffect(() => {
    if (!selectedFolder) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      const segments = selectedFolder.split('/');
      for (let i = 1; i <= segments.length; i++) {
        next.add(segments.slice(0, i).join('/'));
      }
      return next;
    });
  }, [selectedFolder]);

  const handleToggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  return (
    <div aria-label="Medya klasörleri" className={`flex flex-col gap-0.5 ${className}`} role="tree">
      {/* Tüm dosyalar (kök) */}
      <div
        role="treeitem"
        tabIndex={0}
        aria-selected={selectedFolder === null}
        onClick={() => onSelect(null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(null);
          }
        }}
        className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer select-none transition-colors text-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ${
          selectedFolder === null
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-foreground/80 hover:bg-muted hover:text-foreground'
        }`}
      >
        <HardDrive className={`w-4 h-4 shrink-0 ${selectedFolder === null ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="flex-1 truncate">Tüm Dosyalar</span>
        <span
          className={`shrink-0 min-w-6 text-center px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${
            selectedFolder === null ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
          }`}
        >
          {totalCount}
        </span>
      </div>

      <div className="h-px bg-border my-1" />

      {folders.length === 0 ? (
        <p className="px-2 py-3 text-xs text-muted-foreground">Klasör bulunamadı</p>
      ) : (
        folders.map((node) => (
          <FolderRow
            key={node.path}
            node={node}
            depth={0}
            selectedFolder={selectedFolder}
            expanded={expanded}
            onToggle={handleToggle}
            onSelect={onSelect}
          />
        ))
      )}
    </div>
  );
}
