'use client'

import { useState, useEffect } from 'react'

type SidebarCounts = Record<string, number>

export function useSidebarCounts(): SidebarCounts {
  const [counts, setCounts] = useState<SidebarCounts>({})

  useEffect(() => {
    const fetchStats = () => {
      fetch('/api/admin/dashboard-stats')
        .then((res) => res.json())
        .then((data) => {
          setCounts({
            '/admin/news': data.newsCount || 0,
            '/admin/portfolio': data.portfolioCount || 0,
            '/admin/categories': data.categoriesCount || 0,
            '/admin/services': data.servicesCount || 0,
            '/admin/users': data.usersCount || 0,
            '/admin/media': data.mediaCount || 0,
            '/admin/messages': data.unreadMessagesCount || 0,
          })
        })
        .catch((err) => console.error('Failed to load sidebar counts', err))
    }

    fetchStats()
    const intervalId = setInterval(fetchStats, 30000)
    return () => clearInterval(intervalId)
  }, [])

  return counts
}
