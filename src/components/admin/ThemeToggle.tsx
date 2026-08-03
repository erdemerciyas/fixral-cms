'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Mount bilgisini efekt olmadan türet (server'da false, client'ta true)
const subscribeNoop = () => () => {}

export default function ThemeToggle() {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false)
  const { resolvedTheme, setTheme } = useTheme()

  if (!mounted) {
    return <Skeleton className="h-9 w-9 rounded-md" />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      title={isDark ? 'Açık tema' : 'Koyu tema'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
