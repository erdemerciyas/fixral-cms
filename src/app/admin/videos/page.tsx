'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Video as VideoIcon,
  Plus,
  Search,
  Pencil,
  Trash2,
  Play,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { Skeleton } from '@/components/ui/skeleton';

interface Video {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
  duration?: number;
  status: 'published' | 'draft';
  views?: number;
  createdAt: string;
}

export default function AdminVideosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadVideos();
  }, [status, router]);

  const loadVideos = async () => {
    try {
      const response = await fetch('/api/admin/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    const confirmed = await confirm({ title: 'Are you sure?', description: 'Are you sure you want to delete this video?' });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVideos(videos.filter(video => video._id !== videoId));
        toast.success('Video deleted successfully');
      } else {
        toast.error('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Error deleting video');
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || video.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatViews = (views: number | undefined) => {
    if (!views) return '0';
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
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
          <h1 className="text-2xl font-bold text-foreground">Videos</h1>
          <p className="text-muted-foreground mt-1">Manage your video content</p>
        </div>
        <button
          onClick={() => router.push('/admin/content')}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Video
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex space-x-2 bg-muted p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'all'
                ? 'bg-card text-indigo-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              All ({videos.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'published'
                ? 'bg-card text-indigo-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Published ({videos.filter(v => v.status === 'published').length})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'draft'
                ? 'bg-card text-indigo-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Draft ({videos.filter(v => v.status === 'draft').length})
            </button>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video._id}
            className="bg-card rounded-xl shadow-sm border border-border/60 overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950 dark:to-indigo-950">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoIcon className="w-16 h-16 text-purple-300" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${video.status === 'published'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white'
                  }`}>
                  {video.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {video.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {video.description}
              </p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDuration(video.duration)}
                  </span>
                  <span className="flex items-center">
                    <Play className="w-3 h-3 mr-1" />
                    {formatViews(video.views)} views
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(video.createdAt)}
                </span>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(video._id)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <div className="text-center py-16 bg-card rounded-xl border border-border/60">
          <VideoIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No videos found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Add your first video to get started'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={() => router.push('/admin/content')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Video
            </button>
          )}
        </div>
      )}
    </div>
  );
}
