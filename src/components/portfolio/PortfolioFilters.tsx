'use client';

import { useState, useEffect, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search as MagnifyingGlassIcon, X as XMarkIcon, Tag as TagIcon, LayoutGrid as Squares2X2Icon, Calendar as CalendarIcon, Code as CodeBracketIcon, SlidersHorizontal as AdjustmentsHorizontalIcon, ChevronDown as ChevronDownIcon } from 'lucide-react';
import type { Category } from '../../types/portfolio';

interface FilterState {
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

interface PortfolioFiltersProps {
  categories: Category[];
  technologies: string[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
  isLoading?: boolean;
}

export default function PortfolioFilters({
  categories,
  technologies,
  filters,
  onFiltersChange,
  totalResults,
  isLoading = false
}: PortfolioFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounced search
  const [searchValue, setSearchValue] = useState(filters.search);
  useEffect(() => {
    if (searchValue === filters.search) {
      return;
    }
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchValue });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, filters, onFiltersChange]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    if (filters.technologies.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  const handleCategoryToggle = (categorySlug: string) => {
    const newCategories = filters.categories.includes(categorySlug)
      ? filters.categories.filter(c => c !== categorySlug)
      : [...filters.categories, categorySlug];

    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleTechnologyToggle = (tech: string) => {
    const newTechnologies = filters.technologies.includes(tech)
      ? filters.technologies.filter(t => t !== tech)
      : [...filters.technologies, tech];

    onFiltersChange({ ...filters, technologies: newTechnologies });
  };

  const clearAllFilters = () => {
    setSearchValue('');
    onFiltersChange({
      search: '',
      categories: [],
      technologies: [],
      dateRange: { start: '', end: '' },
      sortBy: 'newest',
      sortOrder: 'desc'
    });
  };

  const clearFilter = (type: string, value?: string) => {
    switch (type) {
      case 'search':
        setSearchValue('');
        break;
      case 'category':
        if (value) {
          onFiltersChange({
            ...filters,
            categories: filters.categories.filter(c => c !== value)
          });
        }
        break;
      case 'technology':
        if (value) {
          onFiltersChange({
            ...filters,
            technologies: filters.technologies.filter(t => t !== value)
          });
        }
        break;
      case 'dateRange':
        onFiltersChange({
          ...filters,
          dateRange: { start: '', end: '' }
        });
        break;
    }
  };

  return (
    <div className="bg-card rounded-sm border border-border p-6 md:p-8 mb-8">
      {/* Search and Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Proje ara..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring outline-hidden transition-colors duration-200 motion-reduce:transition-none"
            />
            {searchValue && (
              <button
                onClick={() => clearFilter('search')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent rounded-full transition-colors duration-200"
                aria-label="Aramayı temizle"
              >
                <XMarkIcon className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Sort and Advanced Toggle */}
        <div className="flex gap-3">
          {/* Sort Dropdown */}
          <div className="relative" role="group" aria-label="Sıralama">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [FilterState['sortBy'], FilterState['sortOrder']];
                onFiltersChange({ ...filters, sortBy, sortOrder });
              }}
              className="appearance-none bg-background border border-border rounded-lg px-4 py-3 pr-10 text-foreground focus:border-primary focus:ring-2 focus:ring-ring outline-hidden transition-colors duration-200 cursor-pointer motion-reduce:transition-none"
              aria-label="Sırala"
            >
              <option value="newest-desc">En Yeni</option>
              <option value="oldest-asc">En Eski</option>
              <option value="title-asc">A-Z</option>
              <option value="title-desc">Z-A</option>
              <option value="category-asc">Kategoriye Göre</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center px-6 py-3 rounded-lg font-medium border transition-colors duration-200 motion-reduce:transition-none ${showAdvanced || activeFiltersCount > 0
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            aria-expanded={showAdvanced}
            aria-controls="advanced-filters"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
            Filtreler
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-background/25 rounded-full text-xs font-semibold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm font-medium text-muted-foreground">Aktif Filtreler:</span>

              {/* Search Filter */}
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 bg-accent text-accent-foreground rounded-sm text-sm font-medium">
                  <MagnifyingGlassIcon className="w-4 h-4 mr-1" />
                  &quot;{filters.search}&quot;
                  <button
                    onClick={() => clearFilter('search')}
                    className="ml-2 hover:text-primary"
                    aria-label="Arama filtresini kaldır"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Category Filters */}
              {filters.categories.map(categorySlug => {
                const category = categories.find(c => c.slug === categorySlug);
                return category ? (
                  <span
                    key={categorySlug}
                    className="inline-flex items-center px-3 py-1 bg-secondary text-foreground border border-border rounded-sm text-sm font-medium"
                  >
                    <TagIcon className="w-4 h-4 mr-1 text-muted-foreground" />
                    {category.name}
                    <button
                      onClick={() => clearFilter('category', categorySlug)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      aria-label={`${category.name} filtresini kaldır`}
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })}

              {/* Technology Filters */}
              {filters.technologies.map(tech => (
                <span
                  key={tech}
                  className="inline-flex items-center px-3 py-1 bg-secondary text-foreground border border-border rounded-sm text-sm font-medium"
                >
                  <CodeBracketIcon className="w-4 h-4 mr-1 text-muted-foreground" />
                  {tech}
                  <button
                    onClick={() => clearFilter('technology', tech)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    aria-label={`${tech} filtresini kaldır`}
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Date Range Filter */}
              {(filters.dateRange.start || filters.dateRange.end) && (
                <span className="inline-flex items-center px-3 py-1 bg-secondary text-foreground border border-border rounded-sm text-sm font-medium">
                  <CalendarIcon className="w-4 h-4 mr-1 text-muted-foreground" />
                  {filters.dateRange.start && filters.dateRange.end
                    ? `${filters.dateRange.start} - ${filters.dateRange.end}`
                    : filters.dateRange.start
                      ? `${filters.dateRange.start} sonrası`
                      : `${filters.dateRange.end} öncesi`
                  }
                  <button
                    onClick={() => clearFilter('dateRange')}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    aria-label="Tarih filtresini kaldır"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-sm text-muted-foreground hover:text-foreground underline ml-2"
              >
                Tümünü Temizle
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border pt-6"
            id="advanced-filters"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Categories */}
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center">
                  <TagIcon className="w-5 h-5 mr-2 text-primary" />
                  Kategoriler
                </h3>
                <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                  {categories.map(category => (
                    <label
                      key={category._id}
                      className="flex items-center p-3 rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.slug)}
                        onChange={() => handleCategoryToggle(category.slug)}
                        className="w-4 h-4 accent-[hsl(var(--primary))] border-border rounded"
                      />
                      <span className="ml-3 text-sm font-medium">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center">
                  <CodeBracketIcon className="w-5 h-5 mr-2 text-primary" />
                  Teknolojiler
                </h3>
                <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                  {technologies.map(tech => (
                    <label
                      key={tech}
                      className="flex items-center p-3 rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={filters.technologies.includes(tech)}
                        onChange={() => handleTechnologyToggle(tech)}
                        className="w-4 h-4 accent-[hsl(var(--primary))] border-border rounded"
                      />
                      <span className="ml-3 text-sm font-medium">{tech}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                  Tarih Aralığı
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Başlangıç Tarihi
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, start: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-ring outline-hidden transition-colors duration-200 motion-reduce:transition-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Bitiş Tarihi
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, end: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-ring outline-hidden transition-colors duration-200 motion-reduce:transition-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center text-muted-foreground" role="status" aria-live="polite">
          <Squares2X2Icon className="w-5 h-5 mr-2" />
          <span className="font-medium text-sm">
            {isLoading ? (
              <span className="inline-flex items-center">
                <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin mr-2"></div>
                Yükleniyor...
              </span>
            ) : (
              `${totalResults} proje bulundu`
            )}
          </span>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-accent-foreground hover:text-primary font-semibold transition-colors duration-200"
          >
            Filtreleri Temizle
          </button>
        )}
      </div>
    </div>
  );
}