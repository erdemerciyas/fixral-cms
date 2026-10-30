'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';

/** Filtrelenebilir proje — kategori adları/slug'ları çözülmüş olmalı */
export interface FilterableProject {
  _id: string;
  title: string;
  description?: string;
  client?: string;
  completionDate?: string;
  createdAt?: string;
  technologies?: string[];
  categories?: { name: string; slug: string }[];
  category?: { name: string; slug: string };
  categoryId?: unknown;
}

export interface FilterState {
  search: string;
  categories: string[];
  technologies: string[];
  dateRange: {
    start: string;
    end: string;
  };
  sortBy: 'newest' | 'oldest' | 'title' | 'category';
  sortOrder: 'asc' | 'desc';
}

// Sıralama zamanı: önce createdAt, yoksa completionDate; geçersizse 0
function sortTime(p: { createdAt?: string; completionDate?: string }): number {
  const t = new Date(p.createdAt || p.completionDate || 0).getTime();
  return Number.isNaN(t) ? 0 : t;
}

// URL parametrelerinden filtre durumunu çözer
function parseFiltersFromSearchParams(searchParams: URLSearchParams | null): FilterState {
  const categoriesParam = searchParams?.get('categories');
  const categoryParam = searchParams?.get('category'); // Backward compatibility
  const searchParam = searchParams?.get('search') || '';
  const technologiesParam = searchParams?.get('technologies');
  const sortParam = searchParams?.get('sort') || 'newest-desc';
  const startDateParam = searchParams?.get('startDate') || '';
  const endDateParam = searchParams?.get('endDate') || '';

  let selectedCategories: string[] = [];
  if (categoriesParam) {
    selectedCategories = categoriesParam.split(',').map(slug => slug.trim()).filter(Boolean);
  } else if (categoryParam) {
    selectedCategories = [categoryParam];
  }

  const selectedTechnologies = technologiesParam
    ? technologiesParam.split(',').map(tech => tech.trim()).filter(Boolean)
    : [];

  const [sortBy, sortOrder] = sortParam.split('-') as [FilterState['sortBy'], FilterState['sortOrder']];

  return {
    search: searchParam,
    categories: selectedCategories,
    technologies: selectedTechnologies,
    dateRange: {
      start: startDateParam,
      end: endDateParam
    },
    sortBy: sortBy || 'newest',
    sortOrder: sortOrder || 'desc'
  };
}

interface UsePortfolioFiltersReturn<T extends FilterableProject> {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  filteredProjects: T[];
  isLoading: boolean;
  totalResults: number;
  availableTechnologies: string[];
}

export function usePortfolioFilters<T extends FilterableProject>(
  projects: T[],
  // Geriye uyumluluk için imzada tutulur (kategoriler projelerde çözülmüş gelir)
  _categories: unknown[] = [],
  isLoading: boolean = false
): UsePortfolioFiltersReturn<T> {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = useLocale();

  // Initialize filters from URL params
  const [filters, setFiltersState] = useState<FilterState>(() =>
    parseFiltersFromSearchParams(searchParams)
  );

  // Update URL when filters change
  const updateURL = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    
    if (newFilters.categories.length > 0) {
      params.set('categories', newFilters.categories.join(','));
    }
    
    if (newFilters.technologies.length > 0) {
      params.set('technologies', newFilters.technologies.join(','));
    }
    
    if (newFilters.dateRange.start) {
      params.set('startDate', newFilters.dateRange.start);
    }
    
    if (newFilters.dateRange.end) {
      params.set('endDate', newFilters.dateRange.end);
    }
    
    if (newFilters.sortBy !== 'newest' || newFilters.sortOrder !== 'desc') {
      params.set('sort', `${newFilters.sortBy}-${newFilters.sortOrder}`);
    }

    const newURL = params.toString() ? `/${lang}/portfolio?${params.toString()}` : `/${lang}/portfolio`;
    router.push(newURL, { scroll: false });
  }, [router, lang]);

  const setFilters = useCallback((newFilters: FilterState) => {
    setFiltersState(newFilters);
    updateURL(newFilters);
  }, [updateURL]);

  // Keep filters in sync if URL changes (e.g., back/forward navigation).
  // Render sırasında ayarlama deseni: efekt içi setState yerine, searchParams
  // değiştiğinde aynı render turunda state güncellenir (React'in önerdiği yol).
  const searchParamsKey = searchParams?.toString() ?? '';
  const [prevSearchParamsKey, setPrevSearchParamsKey] = useState(searchParamsKey);
  if (prevSearchParamsKey !== searchParamsKey) {
    setPrevSearchParamsKey(searchParamsKey);
    const nextFilters = parseFiltersFromSearchParams(searchParams);
    setFiltersState(prev =>
      JSON.stringify(prev) === JSON.stringify(nextFilters) ? prev : nextFilters
    );
  }

  // Extract available technologies from all projects
  const availableTechnologies = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach(project => {
      if (project.technologies) {
        project.technologies.forEach(tech => techSet.add(tech));
      }
    });
    return Array.from(techSet).sort();
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    if (isLoading || !projects) return [];

    let filtered = [...projects];

    // Search filter
    if (filters.search) {
      const loc = 'tr-TR';
      const searchLower = filters.search.trim().toLocaleLowerCase(loc);
      const has = (v?: string) => !!v && v.toLocaleLowerCase(loc).includes(searchLower);
      filtered = filtered.filter(project =>
        has(project.title) ||
        has(project.description) ||
        has(project.client) ||
        project.categories?.some(cat => has(cat.name)) ||
        project.technologies?.some(tech => has(tech))
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      // console.debug('Filtering by categories:', filters.categories);
      filtered = filtered.filter(project => {
        // debug helper removed for production cleanliness
        
        // Support both old single category and new multiple categories
        if (project.categories && project.categories.length > 0) {
          const match = project.categories.some(cat => 
            filters.categories.includes(cat.slug) || filters.categories.includes(cat.name)
          );
           // console.debug('Categories match:', match);
          return match;
        } else if (project.category) {
           const match = filters.categories.includes(project.category.slug) || filters.categories.includes(project.category.name);
           // console.debug('Category match:', match);
          return match;
        } else if (project.categoryId && typeof project.categoryId === 'object' && 'slug' in project.categoryId) {
          const categoryObj = project.categoryId as { slug: string; name: string };
          const match = filters.categories.includes(categoryObj.slug) || filters.categories.includes(categoryObj.name);
           // console.debug('CategoryId match:', match);
          return match;
        }
        // console.debug('No category match found');
        return false;
      });
    }

    // Technology filter
    if (filters.technologies.length > 0) {
      filtered = filtered.filter(project =>
        project.technologies?.some(tech => filters.technologies.includes(tech))
      );
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(project => {
        if (!project.completionDate) return false;
        const projectDate = new Date(project.completionDate);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        if (startDate && projectDate < startDate) return false;
        if (endDate && projectDate > endDate) return false;
        return true;
      });
    }

    // Sort projects
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title, lang);
          break;
        case 'category':
          const aCategoryName = a.categories?.[0]?.name || a.category?.name || '';
          const bCategoryName = b.categories?.[0]?.name || b.category?.name || '';
          comparison = aCategoryName.localeCompare(bCategoryName, lang);
          break;
        case 'oldest':
          // Önce createdAt'e göre sırala, yoksa completionDate'e göre
          comparison = sortTime(a) - sortTime(b);
          break;
        case 'newest':
        default:
          // Önce createdAt'e göre sırala, yoksa completionDate'e göre
          comparison = sortTime(b) - sortTime(a);
          
          // Eğer tarihler aynıysa, _id'ye göre sırala (MongoDB ObjectId doğal olarak zaman içerir)
          if (comparison === 0) {
            comparison = b._id.localeCompare(a._id);
          }
          break;
      }

      // newest/oldest yönü sortBy'da tanımlıdır; ad/kategori için sortOrder uygulanır.
      // (Eski sürüm 'asc' seçeneklerini ters çeviriyordu: "En Eski" en yeniyi, "A-Z" Z-A'yı gösteriyordu.)
      if (filters.sortBy === 'title' || filters.sortBy === 'category') {
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      }
      return comparison;
    });

    return filtered;
  }, [projects, filters, isLoading, lang]);

  return {
    filters,
    setFilters,
    filteredProjects,
    isLoading,
    totalResults: filteredProjects.length,
    availableTechnologies
  };
}