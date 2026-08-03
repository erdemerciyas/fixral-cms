import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Durum session'dan türetilir; efekt içi setState gerekmez
  const loading = status === 'loading';

  const user = useMemo<User | null>(() => {
    if (!session?.user) return null;
    return {
      id: session.user.id || '',
      email: session.user.email || '',
      name: session.user.name || '',
      role: (session.user as { role?: string }).role || 'user',
    };
  }, [session]);

  const login = () => {
    router.push('/admin/login');
  };

  const logout = () => {
    router.push('/admin/login');
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}