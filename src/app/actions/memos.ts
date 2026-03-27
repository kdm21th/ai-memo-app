'use server'

import { revalidatePath } from 'next/cache'
import {
  createMemoInDb,
  deleteMemoInDb,
  importLocalMemosToDb,
  updateMemoInDb,
} from '@/lib/memos-store'
import { Memo, MemoFormData } from '@/types/memo'

export async function createMemoAction(formData: MemoFormData): Promise<Memo> {
  const memo = await createMemoInDb(formData)
  revalidatePath('/')
  return memo
}

export async function updateMemoAction(
  id: string,
  formData: MemoFormData
): Promise<Memo> {
  const memo = await updateMemoInDb(id, formData)
  revalidatePath('/')
  return memo
}

export async function deleteMemoAction(id: string): Promise<{ id: string }> {
  await deleteMemoInDb(id)
  revalidatePath('/')
  return { id }
}

export async function importLocalMemosAction(
  localMemos: Memo[]
): Promise<{ importedCount: number }> {
  const result = await importLocalMemosToDb(localMemos)
  revalidatePath('/')
  return result
}
