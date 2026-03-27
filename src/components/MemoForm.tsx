'use client'

import { useState } from 'react'
import {
  Memo,
  MemoFormData,
  MEMO_CATEGORIES,
  DEFAULT_CATEGORIES,
  MEMO_COLORS,
  MEMO_COLOR_LABELS,
  DEFAULT_MEMO_COLOR,
} from '@/types/memo'
import MemoMdEditor from './MemoMdEditor'

interface MemoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MemoFormData) => void | Promise<void>
  editingMemo?: Memo | null
  submitting?: boolean
}

export default function MemoForm({
  isOpen,
  onClose,
  onSubmit,
  editingMemo,
  submitting = false,
}: MemoFormProps) {
  const [formData, setFormData] = useState<MemoFormData>(() =>
    editingMemo
      ? {
          title: editingMemo.title,
          content: editingMemo.content,
          category: editingMemo.category,
          tags: editingMemo.tags,
          color: editingMemo.color,
        }
      : {
          title: '',
          content: '',
          category: 'personal',
          tags: [],
          color: DEFAULT_MEMO_COLOR,
        }
  )
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }
    await onSubmit(formData)
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[92vh] overflow-y-auto">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingMemo ? '메모 편집' : '새 메모 작성'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                제목 *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="placeholder-gray-400 text-gray-400 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="메모 제목을 입력하세요"
                required
              />
            </div>

            {/* 포스트잇 색 */}
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">
                메모 색
              </span>
              <div className="flex flex-wrap gap-2">
                {MEMO_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({ ...prev, color: c }))
                    }
                    title={MEMO_COLOR_LABELS[c]}
                    className={`h-9 w-9 rounded-md border-2 transition-all ${
                      formData.color === c
                        ? 'ring-2 ring-blue-500 ring-offset-2 border-gray-400 scale-105'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${
                      c === 'lemon'
                        ? 'bg-amber-200'
                        : c === 'pink'
                          ? 'bg-pink-200'
                          : c === 'mint'
                            ? 'bg-emerald-200'
                            : c === 'sky'
                              ? 'bg-sky-200'
                              : c === 'lavender'
                                ? 'bg-violet-200'
                                : c === 'peach'
                                  ? 'bg-orange-200'
                                  : 'bg-stone-200'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                선택: {MEMO_COLOR_LABELS[formData.color]}
              </p>
            </div>

            {/* 카테고리 */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                카테고리
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="text-gray-400 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {DEFAULT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {MEMO_CATEGORIES[category]}
                  </option>
                ))}
              </select>
            </div>

            {/* 내용 (마크다운) */}
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">
                내용 * <span className="font-normal text-gray-500">(마크다운)</span>
              </span>
              <MemoMdEditor
                value={formData.content}
                onChange={content =>
                  setFormData(prev => ({ ...prev, content }))
                }
              />
              <p className="mt-2 text-xs text-gray-500">
                편집과 미리보기를 동시에 볼 수 있습니다. 툴바에서 편집/미리보기/분할
                모드를 바꿀 수 있습니다.
              </p>
            </div>

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                태그
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="placeholder-gray-400 text-black flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="태그를 입력하고 Enter를 누르세요"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  추가
                </button>
              </div>

              {/* 태그 목록 */}
              {formData.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg
                          className="w-3 h-3"
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
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 rounded-lg transition-colors"
              >
                {submitting
                  ? editingMemo
                    ? '수정 중...'
                    : '저장 중...'
                  : editingMemo
                    ? '수정하기'
                    : '저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
