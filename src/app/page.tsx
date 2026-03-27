import { listMemosFromDb } from '@/lib/memos-store'
import MemoAppClient from '@/components/MemoAppClient'

export default async function Home() {
  const memos = await listMemosFromDb()

  return <MemoAppClient initialMemos={memos} />
}
