'use client'

import dynamic from 'next/dynamic'

const Markdown = dynamic(
  () => import('@uiw/react-md-editor').then(mod => mod.default.Markdown),
  {
    ssr: false,
    loading: () => (
      <span className="text-sm text-gray-400">미리보기 로딩…</span>
    ),
  }
)

interface MemoMdPreviewProps {
  source: string
  className?: string
  /** 목록 카드용: 높이 제한 + 작은 타이포 */
  compact?: boolean
}

export default function MemoMdPreview({
  source,
  className = '',
  compact = false,
}: MemoMdPreviewProps) {
  if (!source.trim()) {
    return (
      <p className={`text-sm text-gray-500 ${className}`}>내용 없음</p>
    )
  }
  return (
    <div
      data-color-mode="light"
      className={`memo-md-preview text-gray-800 ${compact ? 'memo-md-preview--compact' : ''} ${className}`}
    >
      <Markdown source={source} />
    </div>
  )
}
