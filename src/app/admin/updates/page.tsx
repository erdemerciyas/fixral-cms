'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  CloudDownload,
  Check,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Update {
  _id: string;
  version: string;
  title: string;
  description: string;
  type: 'major' | 'minor' | 'patch';
  status: 'available' | 'installed' | 'failed';
  releaseDate: string;
  size: number;
}

export default function AdminUpdatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadUpdates();
  }, [status, router]);

  const loadUpdates = async () => {
    try {
      const response = await fetch('/api/admin/updates');
      if (response.ok) {
        const data = await response.json();
        setUpdates(data);
      }
    } catch (error) {
      console.error('Error loading updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckForUpdates = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/admin/updates/check', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.updatesAvailable) {
          setUpdates(data.updates);
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleInstallUpdate = async (updateId: string) => {
    try {
      const response = await fetch(`/api/admin/updates/${updateId}/install`, {
        method: 'POST',
      });

      if (response.ok) {
        setUpdates(updates.map(u => 
          u._id === updateId ? { ...u, status: 'installed' } : u
        ));
      }
    } catch (error) {
      console.error('Error installing update:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'minor':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'patch':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-muted text-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return CloudDownload;
      case 'installed':
        return Check;
      case 'failed':
        return AlertTriangle;
      default:
        return ShieldCheck;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Updates</h1>
          <p className="text-muted-foreground mt-1">Keep your system up to date</p>
        </div>
        <button
          onClick={handleCheckForUpdates}
          disabled={checking}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
              <span>Checking...</span>
            </>
          ) : (
            <>
              <CloudDownload className="w-5 h-5 mr-2" />
              Check for Updates
            </>
          )}
        </button>
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">System Status</h3>
            <p className="text-sm text-muted-foreground">
              Your system is running the latest version
            </p>
          </div>
        </div>
      </div>

      {/* Available Updates */}
      {updates.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm border border-border/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Available Updates</h2>
            <p className="text-sm text-muted-foreground">
              {updates.length} update(s) available for installation
            </p>
          </div>
          <div className="divide-y divide-border">
            {updates.map((update) => (
              <div
                key={update._id}
                className="p-6 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(update.type)}`}>
                      {update.status === 'available' && (
                        <CloudDownload className="w-6 h-6 text-white" />
                      )}
                      {update.status === 'installed' && (
                        <Check className="w-6 h-6 text-white" />
                      )}
                      {update.status === 'failed' && (
                        <AlertTriangle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {update.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(update.type)}`}>
                          {update.type}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          v{update.version}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{formatFileSize(update.size)}</span>
                    <span>•</span>
                    <span>{formatDate(update.releaseDate)}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {update.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Released {formatDate(update.releaseDate)}</span>
                  </div>
                  {update.status === 'available' && (
                    <button
                      onClick={() => handleInstallUpdate(update._id)}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
                    >
                      Install Update
                    </button>
                  )}
                  {update.status === 'installed' && (
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-medium">
                      Installed
                    </span>
                  )}
                  {update.status === 'failed' && (
                    <button
                      onClick={() => handleInstallUpdate(update._id)}
                      className="px-6 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors"
                    >
                      Retry Installation
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Updates Available */}
      {updates.length === 0 && (
        <div className="text-center py-16 bg-card rounded-xl border border-border/60">
          <ShieldCheck className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Updates Available</h3>
          <p className="text-muted-foreground mb-6">
            Your system is up to date with the latest version
          </p>
          <button
            onClick={handleCheckForUpdates}
            disabled={checking}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                <span>Checking...</span>
              </>
            ) : (
              <>
                <CloudDownload className="w-5 h-5 mr-2" />
                Check for Updates
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
