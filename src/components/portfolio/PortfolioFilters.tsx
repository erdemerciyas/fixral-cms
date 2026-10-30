'use client';

/**
 * Portfolyo filtre çubuğu (redesign 2026).
 * Kategori çipleri (aria-pressed), gecikmeli arama, sıralama, teknoloji ve
 * tarih aralığı filtreleri. Durum URL'de tutulur (usePortfolioFilters).
 */
import { useEffect, useId, useState } from 'react';
import { usePfT } from './usePfT';
import { SearchIcon, CloseIcon } from '@/components/fx/FxIcons';
import type { FilterState } from '@/hooks/usePortfolioFilters';

interface PortfolioFiltersProps {
  categories: { _id: string; name: string; slug: string }[];
  technologies: string[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
  isLoading?: boolean;
}

export const EMPTY_FILTERS: FilterState = {
  search: '',
  categories: [],
  technologies: [],
  dateRange: { start: '', end: '' },
  sortBy: 'newest',
  sortOrder: 'desc',
};

const SORTS = [
  ['newest-desc', 'sortNewest'],
  ['oldest-asc', 'sortOldest'],
  ['title-asc', 'sortAz'],
  ['title-desc', 'sortZa'],
  ['category-asc', 'sortCategory'],
] as const;

export default function PortfolioFilters({
  categories,
  technologies,
  filters,
  onFiltersChange,
  totalResults,
  isLoading = false,
}: PortfolioFiltersProps) {
  const t = usePfT();
  const uid = useId();
  const advancedOn = filters.technologies.length > 0 || !!filters.dateRange.start || !!filters.dateRange.end;
  const [showAdvanced, setShowAdvanced] = useState(advancedOn);

  // Gecikmeli arama: yazarken URL her tuşta değişmesin
  const [searchValue, setSearchValue] = useState(filters.search);
  const [syncedSearch, setSyncedSearch] = useState(filters.search);
  if (syncedSearch !== filters.search) {
    // URL (geri/ileri) değişince kutu da güncellenir
    setSyncedSearch(filters.search);
    setSearchValue(filters.search);
  }
  useEffect(() => {
    if (searchValue === filters.search) return;
    const timer = setTimeout(() => onFiltersChange({ ...filters, search: searchValue }), 300);
    return () => clearTimeout(timer);
  }, [searchValue, filters, onFiltersChange]);

  const activeCount = [
    filters.search,
    filters.categories.length > 0,
    filters.technologies.length > 0,
    filters.dateRange.start || filters.dateRange.end,
  ].filter(Boolean).length;

  const toggleCategory = (slug: string) => {
    const next = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug];
    onFiltersChange({ ...filters, categories: next });
  };
  const toggleTech = (tech: string) => {
    const next = filters.technologies.includes(tech)
      ? filters.technologies.filter((x) => x !== tech)
      : [...filters.technologies, tech];
    onFiltersChange({ ...filters, technologies: next });
  };
  const clearAll = () => {
    setSearchValue('');
    onFiltersChange({ ...EMPTY_FILTERS, sortBy: filters.sortBy, sortOrder: filters.sortOrder });
  };

  const sortValue = `${filters.sortBy}-${filters.sortOrder}`;
  const panelId = `${uid}-adv`;

  return (
    <div className="fx-pf-filters">
      {categories.length > 0 && (
        <div className="fx-filters fx-pf-cats" role="group" aria-label={t('filters.group')}>
          <button
            type="button"
            className="fx-chip"
            aria-pressed={filters.categories.length === 0}
            onClick={() => filters.categories.length && onFiltersChange({ ...filters, categories: [] })}
          >
            {t('filters.all')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              className="fx-chip"
              aria-pressed={filters.categories.includes(cat.slug)}
              onClick={() => toggleCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="fx-pf-bar">
        <div className="fx-field fx-pf-search">
          <label htmlFor={`${uid}-q`} className="sr-only">{t('filters.search')}</label>
          <SearchIcon className="fx-pf-search__icon" />
          <input
            id={`${uid}-q`}
            type="search"
            inputMode="search"
            autoComplete="off"
            placeholder={t('filters.searchPh')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button
              type="button"
              className="fx-pf-search__clear"
              aria-label={t('filters.clearSearch')}
              onClick={() => {
                setSearchValue('');
                onFiltersChange({ ...filters, search: '' });
              }}
            >
              <CloseIcon />
            </button>
          )}
        </div>

        <div className="fx-field fx-pf-sort">
          <label htmlFor={`${uid}-s`} className="sr-only">{t('filters.sort')}</label>
          <select
            id={`${uid}-s`}
            value={sortValue}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [FilterState['sortBy'], FilterState['sortOrder']];
              onFiltersChange({ ...filters, sortBy, sortOrder });
            }}
          >
            {SORTS.map(([v, k]) => (
              <option key={v} value={v}>{t(`filters.${k}`)}</option>
            ))}
          </select>
        </div>

        {(technologies.length > 0 || advancedOn) && (
          <button
            type="button"
            className="fx-btn fx-btn--ghost fx-pf-more"
            aria-expanded={showAdvanced}
            aria-controls={panelId}
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {t('filters.more')}
            {(filters.technologies.length > 0 || filters.dateRange.start || filters.dateRange.end) && (
              <span className="fx-pf-count fx-mono" aria-hidden="true">
                {filters.technologies.length + (filters.dateRange.start || filters.dateRange.end ? 1 : 0)}
              </span>
            )}
          </button>
        )}
      </div>

      <div id={panelId} className="fx-pf-adv" hidden={!showAdvanced}>
        {technologies.length > 0 && (
          <fieldset className="fx-fieldset">
            <legend className="fx-pf-lbl">{t('filters.tech')}</legend>
            <div className="fx-chips" role="group" aria-label={t('filters.techGroup')}>
              {technologies.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  className="fx-chip fx-chip--sm fx-mono"
                  aria-pressed={filters.technologies.includes(tech)}
                  onClick={() => toggleTech(tech)}
                >
                  {tech}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <fieldset className="fx-fieldset">
          <legend className="fx-pf-lbl">{t('filters.date')}</legend>
          <div className="fx-row2">
            <div className="fx-field">
              <label htmlFor={`${uid}-from`}>{t('filters.from')}</label>
              <input
                id={`${uid}-from`}
                type="date"
                value={filters.dateRange.start}
                max={filters.dateRange.end || undefined}
                onChange={(e) => onFiltersChange({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
              />
            </div>
            <div className="fx-field">
              <label htmlFor={`${uid}-to`}>{t('filters.to')}</label>
              <input
                id={`${uid}-to`}
                type="date"
                value={filters.dateRange.end}
                min={filters.dateRange.start || undefined}
                onChange={(e) => onFiltersChange({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
              />
            </div>
          </div>
        </fieldset>
      </div>

      <div className="fx-pf-status">
        <span className="fx-tag" role="status" aria-live="polite" aria-busy={isLoading}>
          {totalResults === 1 ? t('filters.resultsOne') : t('filters.results', { count: totalResults })}
        </span>
        {activeCount > 0 && (
          <button type="button" className="fx-pf-clear" onClick={clearAll}>
            <CloseIcon />
            {t('filters.clear')}
          </button>
        )}
      </div>
    </div>
  );
}
