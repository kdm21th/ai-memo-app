'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createMemoAction,
  deleteMemoAction,
  importLocalMemosAction,
  updateMemoAction,
} from '@/app/actions/memos'
import { useMemos } from '@/hooks/useMemos'
import { Memo, MemoFormData } from '@/types/memo'
import { localStorageUtils } from '@/utils/localStorage'
import MemoDetail from './MemoDetail'
import MemoForm from './MemoForm'
import MemoList from './MemoList'

interface MemoAppClientProps {
  initialMemos: Memo[]
}

export default function MemoAppClient({ initialMemos }: MemoAppClientProps) {
  const router = useRouter()
  const {
    memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,
    setMemos,
    searchMemos,
    filterByCategory,
  } = useMemos(initialMemos)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null)
  const [viewingMemo, setViewingMemo] = useState<Memo | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [localMemoCount, setLocalMemoCount] = useState(0)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  useEffect(() => {
    setLocalMemoCount(localStorageUtils.getMemos().length)
  }, [])

  const canImportLocalMemos = useMemo(() => localMemoCount > 0, [localMemoCount])

  const refreshData = () => {
    router.refresh()
  }

  const handleCreateMemo = async (formData: MemoFormData) => {
    setSubmitting(true)
    try {
      const createdMemo = await createMemoAction(formData)
      setMemos(prev => [createdMemo, ...prev])
      setIsFormOpen(false)
      setEditingMemo(null)
      refreshData()
    } catch (error) {
      alert(
        error instanceof Error ? error.message : '메모 생성 중 오류가 발생했습니다.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateMemo = async (formData: MemoFormData) => {
    if (!editingMemo) return

    setSubmitting(true)
    try {
      const updatedMemo = await updateMemoAction(editingMemo.id, formData)
      setMemos(prev =>
        prev.map(memo => (memo.id === updatedMemo.id ? updatedMemo : memo))
      )
      setEditingMemo(null)
      setIsFormOpen(false)
      setViewingMemo(updatedMemo)
      refreshData()
    } catch (error) {
      alert(
        error instanceof Error ? error.message : '메모 수정 중 오류가 발생했습니다.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const deleteMemo = async (id: string) => {
    try {
      await deleteMemoAction(id)
      setMemos(prev => prev.filter(memo => memo.id !== id))
      if (viewingMemo?.id === id) {
        setViewingMemo(null)
      }
      if (editingMemo?.id === id) {
        setEditingMemo(null)
        setIsFormOpen(false)
      }
      refreshData()
    } catch (error) {
      alert(
        error instanceof Error ? error.message : '메모 삭제 중 오류가 발생했습니다.'
      )
    }
  }

  const handleEditMemo = (memo: Memo) => {
    setViewingMemo(null)
    setEditingMemo(memo)
    setIsFormOpen(true)
  }

  const handleViewMemo = (memo: Memo) => {
    setViewingMemo(memo)
  }

  const handleCloseForm = () => {
    if (submitting) return
    setIsFormOpen(false)
    setEditingMemo(null)
  }

  const handleImportLocalMemos = async (clearAfterImport: boolean) => {
    const localMemos = localStorageUtils.getMemos()
    if (localMemos.length === 0) {
      setLocalMemoCount(0)
      return
    }

    setImporting(true)
    setImportMessage(null)
    setImportError(null)

    try {
      const result = await importLocalMemosAction(localMemos)
      if (clearAfterImport) {
        localStorageUtils.clearMemos()
        setLocalMemoCount(0)
      }
      setImportMessage(
        clearAfterImport
          ? `${result.importedCount}개의 로컬 메모를 가져오고 브라우저 저장소를 비웠습니다.`
          : `${result.importedCount}개의 로컬 메모를 Supabase로 가져왔습니다.`
      )
      const latestMemos = clearAfterImport
        ? []
        : localStorageUtils.getMemos()
      setLocalMemoCount(latestMemos.length)
      refreshData()
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : '로컬 메모 가져오기 중 오류가 발생했습니다.'
      )
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">📝 메모 앱</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                새 메모
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {canImportLocalMemos && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  브라우저 LocalStorage 메모 {localMemoCount}개 발견
                </h2>
                <p className="mt-1 text-sm text-amber-800">
                  기존 로컬 메모를 Supabase로 가져올 수 있습니다. 중복 ID는 덮어씁니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={importing}
                  onClick={() => void handleImportLocalMemos(false)}
                  className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
                >
                  {importing ? '가져오는 중…' : 'Supabase로 가져오기'}
                </button>
                <button
                  type="button"
                  disabled={importing}
                  onClick={() => void handleImportLocalMemos(true)}
                  className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:text-amber-400"
                >
                  가져오고 로컬 비우기
                </button>
              </div>
            </div>
            {importMessage && (
              <p className="mt-3 text-sm text-emerald-700">{importMessage}</p>
            )}
            {importError && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {importError}
              </p>
            )}
          </div>
        )}

        <MemoList
          memos={memos}
          loading={loading}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSearchChange={searchMemos}
          onCategoryChange={filterByCategory}
          onEditMemo={handleEditMemo}
          onDeleteMemo={id => {
            void deleteMemo(id)
          }}
          onViewMemo={handleViewMemo}
          stats={stats}
        />
      </main>

      <MemoDetail
        memo={viewingMemo}
        onClose={() => setViewingMemo(null)}
        onEdit={handleEditMemo}
        onDelete={id => {
          void deleteMemo(id)
        }}
      />

      {isFormOpen && (
        <MemoForm
          key={editingMemo?.id ?? 'new'}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={editingMemo ? handleUpdateMemo : handleCreateMemo}
          editingMemo={editingMemo}
          submitting={submitting}
        />
      )}
    </div>
  )
}
