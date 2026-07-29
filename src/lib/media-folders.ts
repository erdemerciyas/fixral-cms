// Medya kütüphanesi için paylaşılan tipler ve klasör ağacı yardımcıları.
// Klasör hiyerarşisi Cloudinary public_id yollarından türetilir ve
// hem admin medya sayfasında hem de MediaBrowser seçicisinde kullanılır.

export interface MediaLibraryItem {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string | Date;
  source?: 'cloudinary' | 'local';
  publicId?: string;
  folder: string;
  resourceType?: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface MediaFolderNode {
  /** Klasör adı (son segment) */
  name: string;
  /** Kökten tam yol, örn. "fixral/portfolio" */
  path: string;
  /** Sadece bu klasördeki dosya sayısı */
  directCount: number;
  /** Bu klasör + tüm alt klasörlerdeki toplam dosya sayısı */
  totalCount: number;
  children: MediaFolderNode[];
}

/**
 * Düz medya listesinden klasör ağacı üretir.
 * Her düğüm doğrudan ve kümülatif dosya sayısı taşır.
 */
export function buildFolderTree(items: MediaLibraryItem[]): MediaFolderNode[] {
  const rootNodes: MediaFolderNode[] = [];
  const nodeByPath = new Map<string, MediaFolderNode>();

  const ensureNode = (path: string): MediaFolderNode => {
    const existing = nodeByPath.get(path);
    if (existing) return existing;

    const segments = path.split('/');
    const node: MediaFolderNode = {
      name: segments[segments.length - 1],
      path,
      directCount: 0,
      totalCount: 0,
      children: [],
    };
    nodeByPath.set(path, node);

    if (segments.length === 1) {
      rootNodes.push(node);
    } else {
      const parent = ensureNode(segments.slice(0, -1).join('/'));
      parent.children.push(node);
    }
    return node;
  };

  for (const item of items) {
    if (!item.folder) continue;
    const node = ensureNode(item.folder);
    node.directCount += 1;

    // Kümülatif sayaç: klasörün kendisi + tüm üst klasörler
    const segments = item.folder.split('/');
    for (let i = 1; i <= segments.length; i++) {
      const ancestor = nodeByPath.get(segments.slice(0, i).join('/'));
      if (ancestor) ancestor.totalCount += 1;
    }
  }

  const sortNodes = (nodes: MediaFolderNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(rootNodes);

  return rootNodes;
}

/** Klasör yolunu breadcrumb segmentlerine çevirir. */
export function folderToBreadcrumbs(path: string | null): Array<{ name: string; path: string }> {
  if (!path) return [];
  const segments = path.split('/');
  return segments.map((name, i) => ({
    name,
    path: segments.slice(0, i + 1).join('/'),
  }));
}

/** Kök dışındaki dosya sayısı da dahil, toplam kök seviyesi sayacı. */
export function countRootItems(items: MediaLibraryItem[]): number {
  return items.filter((item) => !item.folder).length;
}

/**
 * Seçili klasöre göre öğeleri filtreler.
 * - null: tüm dosyalar (kısıtlama yok)
 * - '' (kök): sadece klasörsüz dosyalar
 * - 'a/b': o klasör ve tüm alt klasörleri
 */
export function filterItemsByFolder<T extends { folder: string }>(
  items: T[],
  folder: string | null,
  includeSubfolders = true
): T[] {
  if (folder === null) return items;
  if (folder === '') return items.filter((item) => !item.folder);
  return items.filter((item) =>
    includeSubfolders
      ? item.folder === folder || item.folder.startsWith(`${folder}/`)
      : item.folder === folder
  );
}
