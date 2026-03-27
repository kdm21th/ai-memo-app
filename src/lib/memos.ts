import { Memo, MemoFormData, normalizeMemo } from '@/types/memo'

export interface MemoRow {
  id: string
  title: string
  content: string
  category: string
  tags: string[] | null
  color: string
  createdAt: string
  updatedAt: string
}

export function nowIsoString(): string {
  return new Date().toISOString()
}

export function memoRowToMemo(row: MemoRow): Memo {
  return normalizeMemo({
    ...row,
    tags: row.tags ?? [],
  })
}

export function validateMemoFormData(input: MemoFormData): MemoFormData {
  return normalizeMemo({
    id: 'validation-only',
    ...input,
    createdAt: nowIsoString(),
    updatedAt: nowIsoString(),
  })
}

export function normalizeImportedMemo(input: Memo): Memo {
  return normalizeMemo(input as unknown as Record<string, unknown>)
}

export function memoToInsertRow(memo: Memo) {
  return {
    id: memo.id,
    title: memo.title,
    content: memo.content,
    category: memo.category,
    tags: memo.tags,
    color: memo.color,
    createdAt: memo.createdAt,
    updatedAt: memo.updatedAt,
  }
}

export function formDataToNewMemo(id: string, formData: MemoFormData): Memo {
  const now = nowIsoString()
  const valid = validateMemoFormData(formData)
  return {
    id,
    ...valid,
    createdAt: now,
    updatedAt: now,
  }
}

export function formDataToUpdatedMemo(
  existingMemo: Memo,
  formData: MemoFormData
): Memo {
  const valid = validateMemoFormData(formData)
  return {
    ...existingMemo,
    ...valid,
    updatedAt: nowIsoString(),
  }
}
