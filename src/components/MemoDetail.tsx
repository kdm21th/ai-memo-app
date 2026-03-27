'use client'

import { useEffect, useCallback, useState } from 'react'
import { Memo, MEMO_CATEGORIES, getPostItClasses } from '@/types/memo'
import MemoMdPreview from './MemoMdPreview'

interface MemoDetailProps {
  memo: Memo | null
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void | Promise<void>
}

export default function MemoDetail({
  memo,
  onClose,
  onEdit,
  onDelete,
}: MemoDetailProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!memo) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [memo, handleKeyDown])

  useEffect(() => {
    if (!memo) return
    setSummary(null)
    setSummaryError(null)
    setSummaryLoading(false)
  }, [memo])

  const handleSummarize = useCallback(async () => {
    if (!memo) return
    setSummaryLoading(true)
    setSummaryError(null)
    try {
      const res = await fetch('/api/memo/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoId: memo.id }),
      })
      const data = (await res.json()) as { summary?: string; error?: string }
      if (!res.ok) {
        setSummaryError(data.error ?? '요약에 실패했습니다.')
        return
      }
      if (data.summary) setSummary(data.summary)
    } catch {
      setSummaryError('네트워크 오류가 발생했습니다.')
    } finally {
      setSummaryLoading(false)
    }
  }, [memo])

  if (!memo) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || colors.other
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleDelete = async () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      await onDelete(memo.id)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      data-testid="memo-detail-backdrop"
    >
      <div
        className={`rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden ${getPostItClasses(memo.color)}`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-white/30 backdrop-blur-[2px]">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold bg-white/70 backdrop-blur-sm ${getCategoryColor(memo.category)}`}
            >
              {MEMO_CATEGORIES[
                memo.category as keyof typeof MEMO_CATEGORIES
              ] || memo.category}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(memo)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-colors"
              title="편집"
              data-testid="memo-detail-edit-btn"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-white/50 rounded-lg transition-colors"
              title="삭제"
              data-testid="memo-detail-delete-btn"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
              title="닫기 (ESC)"
              data-testid="memo-detail-close-btn"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {memo.title}
          </h2>

          <div className="mb-6 rounded-xl border border-black/10 bg-white/40 p-4 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-800">AI 요약</h3>
              <button
                type="button"
                onClick={handleSummarize}
                disabled={summaryLoading || !memo.content.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                data-testid="memo-detail-summarize-btn"
              >
                {summaryLoading ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    요약 중…
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Gemini로 요약
                  </>
                )}
              </button>
            </div>
            {summaryError && (
              <p
                className="text-sm text-red-600"
                role="alert"
                data-testid="memo-detail-summarize-error"
              >
                {summaryError}
              </p>
            )}
            {summary && !summaryError && (
              <div
                className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed"
                data-testid="memo-detail-summarize-result"
              >
                {summary}
              </div>
            )}
            {!summary && !summaryError && !summaryLoading && (
              <p className="text-xs text-gray-500">
                버튼을 누르면 Gemini({`gemini-2.5-flash-lite`})로 이 메모를
                요약합니다.
              </p>
            )}
          </div>

          <div className="text-gray-800 max-w-none">
            <MemoMdPreview source={memo.content} />
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-black/10 bg-white/25 backdrop-blur-[2px]">
          <div className="flex items-center justify-between">
            {/* 태그 */}
            <div className="flex gap-2 flex-wrap">
              {memo.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/55 text-gray-700 text-xs rounded-md border border-black/5"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 날짜 정보 */}
            <div className="text-xs text-gray-500 text-right shrink-0 ml-4">
              <div>작성: {formatDate(memo.createdAt)}</div>
              {memo.createdAt !== memo.updatedAt && (
                <div>수정: {formatDate(memo.updatedAt)}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
