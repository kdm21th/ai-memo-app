export type MemoColor =
  | 'lemon'
  | 'pink'
  | 'mint'
  | 'sky'
  | 'lavender'
  | 'peach'
  | 'cream'

export const MEMO_COLORS: MemoColor[] = [
  'lemon',
  'pink',
  'mint',
  'sky',
  'lavender',
  'peach',
  'cream',
]

export const DEFAULT_MEMO_COLOR: MemoColor = 'lemon'

export const MEMO_COLOR_LABELS: Record<MemoColor, string> = {
  lemon: '레몬',
  pink: '핑크',
  mint: '민트',
  sky: '하늘',
  lavender: '라벤더',
  peach: '피치',
  cream: '크림',
}

/** 메모 카드·상세에 쓰는 포스트잇 배경·테두리 (Tailwind 클래스) */
export const MEMO_POST_IT_CLASSES: Record<MemoColor, string> = {
  lemon:
    'bg-amber-50 border-amber-200/90 shadow-[4px_4px_0_0_rgba(217,119,6,0.12)]',
  pink: 'bg-pink-50 border-pink-200/90 shadow-[4px_4px_0_0_rgba(219,39,119,0.12)]',
  mint: 'bg-emerald-50 border-emerald-200/90 shadow-[4px_4px_0_0_rgba(5,150,105,0.12)]',
  sky: 'bg-sky-50 border-sky-200/90 shadow-[4px_4px_0_0_rgba(2,132,199,0.12)]',
  lavender:
    'bg-violet-50 border-violet-200/90 shadow-[4px_4px_0_0_rgba(124,58,237,0.12)]',
  peach:
    'bg-orange-50 border-orange-200/90 shadow-[4px_4px_0_0_rgba(234,88,12,0.12)]',
  cream:
    'bg-stone-100 border-stone-300/80 shadow-[4px_4px_0_0_rgba(120,113,108,0.12)]',
}

export function isMemoColor(value: unknown): value is MemoColor {
  return typeof value === 'string' && MEMO_COLORS.includes(value as MemoColor)
}

export function getPostItClasses(color: MemoColor | undefined): string {
  const key = color && isMemoColor(color) ? color : DEFAULT_MEMO_COLOR
  return MEMO_POST_IT_CLASSES[key]
}

export interface Memo {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  color: MemoColor
  createdAt: string
  updatedAt: string
}

export interface MemoFormData {
  title: string
  content: string
  category: string
  tags: string[]
  color: MemoColor
}

export type MemoCategory = 'personal' | 'work' | 'study' | 'idea' | 'other'

export const MEMO_CATEGORIES: Record<MemoCategory, string> = {
  personal: '개인',
  work: '업무',
  study: '학습',
  idea: '아이디어',
  other: '기타',
}

export const DEFAULT_CATEGORIES = Object.keys(MEMO_CATEGORIES) as MemoCategory[]

/** LocalStorage 등에서 불완전한 객체를 Memo로 보정 */
export function normalizeMemo(raw: Record<string, unknown>): Memo {
  const tagsRaw = raw.tags
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw.map(t => String(t))
    : []

  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    content: String(raw.content ?? ''),
    category: String(raw.category ?? 'other'),
    tags,
    color: isMemoColor(raw.color) ? raw.color : DEFAULT_MEMO_COLOR,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
  }
}
