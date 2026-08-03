import { useState, useEffect, useCallback } from 'react';
import { cache, CacheKeys } from '../lib/cache';

interface UseApiOptions {
  cacheKey?: string;
  cacheTTL?: number;
  immediate?: boolean;
  method?: string;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  url: string, 
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    immediate = true,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (cacheKey) {
        const cachedData = cache.get<T>(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          onSuccess?.(cachedData);
          return;
        }
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      if (cacheKey) {
        cache.set(cacheKey, result, cacheTTL);
      }

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      // Don't log 404 errors for public APIs to console
      if (!error.message.includes('404') || url.includes('/admin/')) {
        console.warn(`API Error for ${url}:`, error.message);
      }
      
      setError(error);
      onError?.(error);
      
      // Set null data for failed requests
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url, cacheKey, cacheTTL, onSuccess, onError]);

  useEffect(() => {
    if (!immediate) return;
    // Ertelenmiş başlatma: efekt gövdesinde senkron setState yerine
    // bir sonraki tick'te fetch tetiklenir
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData, immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Specialized hooks for common API calls
export function useSliderItems() {
  return useApi('/api/public/slider', {
    cacheKey: CacheKeys.SLIDER,
    cacheTTL: 10 * 60 * 1000 // 10 minutes for slider
  });
}

export function usePortfolioItems(options?: { 
  limit?: number; 
  featured?: boolean; 
  random?: boolean; 
}) {
  const params = new URLSearchParams();
  
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.featured) params.append('featured', 'true');
  if (options?.random) params.append('random', 'true');
  
  const url = `/api/portfolio${params.toString() ? `?${params.toString()}` : ''}`;
  const cacheKey = `${CacheKeys.PORTFOLIO}_${params.toString()}`;
  
  return useApi(url, {
    cacheKey,
    cacheTTL: options?.random ? 0 : 5 * 60 * 1000 // Random için cache yok, normal için 5 dakika
  });
}

export function useServices() {
  return useApi('/api/public/services', {
    cacheKey: CacheKeys.SERVICES,
    cacheTTL: 10 * 60 * 1000 // 10 minutes
  });
}

export function useSiteSettings() {
  return useApi('/api/admin/site-settings', {
    cacheKey: CacheKeys.SITE_SETTINGS,
    cacheTTL: 15 * 60 * 1000 // 15 minutes
  });
}