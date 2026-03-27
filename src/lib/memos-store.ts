import 'server-only'

import { v4 as uuidv4 } from 'uuid'
import {
  formDataToNewMemo,
  formDataToUpdatedMemo,
  MemoRow,
  memoRowToMemo,
  memoToInsertRow,
  normalizeImportedMemo,
} from '@/lib/memos'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Memo, MemoFormData } from '@/types/memo'

const MEMOS_TABLE = 'memos'

export async function listMemosFromDb(): Promise<Memo[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from(MEMOS_TABLE)
    .select('*')
    .order('updatedAt', { ascending: false })

  if (error) {
    console.error('Failed to list memos:', error)
    throw new Error('메모를 불러오지 못했습니다.')
  }

  return (data ?? []).map(row => memoRowToMemo(row as MemoRow))
}

export async function getMemoByIdFromDb(id: string): Promise<Memo | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from(MEMOS_TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch memo by id:', error)
    throw new Error('메모를 불러오지 못했습니다.')
  }

  return data ? memoRowToMemo(data as MemoRow) : null
}

export async function createMemoInDb(formData: MemoFormData): Promise<Memo> {
  const memo = formDataToNewMemo(uuidv4(), formData)
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from(MEMOS_TABLE)
    .insert(memoToInsertRow(memo))
    .select('*')
    .single()

  if (error) {
    console.error('Failed to create memo:', error)
    throw new Error('메모 생성에 실패했습니다.')
  }

  return memoRowToMemo(data as MemoRow)
}

export async function updateMemoInDb(
  id: string,
  formData: MemoFormData
): Promise<Memo> {
  const existingMemo = await getMemoByIdFromDb(id)
  if (!existingMemo) {
    throw new Error('수정할 메모를 찾을 수 없습니다.')
  }

  const memo = formDataToUpdatedMemo(existingMemo, formData)
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from(MEMOS_TABLE)
    .update(memoToInsertRow(memo))
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    console.error('Failed to update memo:', error)
    throw new Error('메모 수정에 실패했습니다.')
  }

  return memoRowToMemo(data as MemoRow)
}

export async function deleteMemoInDb(id: string): Promise<void> {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from(MEMOS_TABLE).delete().eq('id', id)

  if (error) {
    console.error('Failed to delete memo:', error)
    throw new Error('메모 삭제에 실패했습니다.')
  }
}

export async function importLocalMemosToDb(
  localMemos: Memo[]
): Promise<{ importedCount: number }> {
  const normalizedMemos = localMemos.map(memo => normalizeImportedMemo(memo))
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from(MEMOS_TABLE).upsert(
    normalizedMemos.map(memoToInsertRow),
    {
      onConflict: 'id',
    }
  )

  if (error) {
    console.error('Failed to import local memos:', error)
    throw new Error('로컬 메모 가져오기에 실패했습니다.')
  }

  return { importedCount: normalizedMemos.length }
}
