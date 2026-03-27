'use client'

import dynamic from 'next/dynamic'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-12 text-center text-sm text-gray-500">
        마크다운 편집기를 불러오는 중…
      </div>
    ),
  }
)

interface MemoMdEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function MemoMdEditor({ value, onChange }: MemoMdEditorProps) {
  return (
    <div data-color-mode="light" className="w-full [&_.w-md-editor]:rounded-lg [&_.w-md-editor]:border [&_.w-md-editor]:border-gray-200">
      <MDEditor
        value={value}
        onChange={v => onChange(v ?? '')}
        preview="live"
        visibleDragbar
        height={420}
        highlightEnable
        textareaProps={{
          placeholder: '마크다운으로 내용을 작성하세요…',
        }}
      />
    </div>
  )
}
