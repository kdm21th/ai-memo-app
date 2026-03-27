'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Memo } from '@/types/memo'

export const useMemos = (initialMemos: Memo[]) => {
  const [allMemos, setMemos] = useState<Memo[]>(initialMemos)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    setMemos(initialMemos)
  }, [initialMemos])

  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  const filteredMemos = useMemo(() => {
    let filtered = allMemos

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          memo.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [allMemos, searchQuery, selectedCategory])

  const stats = useMemo(() => {
    const categoryCounts = allMemos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: allMemos.length,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [allMemos, filteredMemos.length])

  return {
    memos: filteredMemos,
    allMemos,
    loading: false,
    searchQuery,
    selectedCategory,
    stats,
    setMemos,
    searchMemos,
    filterByCategory,
  }
}
