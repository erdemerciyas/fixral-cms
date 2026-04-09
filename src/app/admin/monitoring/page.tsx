'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Clock,
  Server,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SystemMetric {
  name: string;
  value: string;
  status: 'operational' | 'warning' | 'error';
  change?: number;
  icon: any;
}

interface ActivityLog {
  id: string;
  action: string;
  status: 'success' | 'error' | 'warning';
  timestamp: string;
}

export default function AdminMonitoringPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadMonitoringData();
  }, [status, router]);

  const loadMonitoringData = async () => {
    try {
      const [metricsRes, logsRes] = await Promise.all([
        fetch('/api/admin/monitoring/metrics'),
        fetch('/api/admin/monitoring/logs'),
      ]);

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'warning':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-muted text-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return CheckCircle;
      case 'warning':
        return Clock;
      case 'error':
        return XCircle;
      default:
        return Server;
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Monitoring</h1>
        <p className="text-muted-foreground mt-1">Real-time system health and performance metrics</p>
      </div>

      {/* System Status Overview */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">System Status</h3>
            <p className="text-sm text-muted-foreground">All systems operational</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className={`bg-card rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all duration-300 ${getStatusColor(metric.status)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  metric.status === 'operational' ? 'bg-emerald-500' :
                  metric.status === 'warning' ? 'bg-amber-500' :
                  'bg-red-500'
                }`}>
                  <metric.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {metric.name}
                </h3>
              </div>
              {metric.change !== undefined && (
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  metric.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {metric.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metric.value}
            </p>
            <p className="text-sm text-muted-foreground capitalize">
              {metric.status}
            </p>
          </div>
        ))}
      </div>

      {/* Activity Logs */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
        </div>
        <div className="divide-y divide-border">
          {logs.length > 0 ? (
            logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    log.status === 'success' ? 'bg-emerald-500' :
                    log.status === 'error' ? 'bg-red-500' :
                    'bg-amber-500'
                  }`}>
                    {log.status === 'success' && <CheckCircle className="w-4 h-4 text-white" />}
                    {log.status === 'error' && <XCircle className="w-4 h-4 text-white" />}
                    {log.status === 'warning' && <Clock className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {log.action}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <BarChart className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No activity logs</h3>
              <p className="text-muted-foreground">
                Activity will appear here once your system starts logging events
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
