import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'
import { getMemoByIdFromDb } from '@/lib/memos-store'

const MODEL_ID = 'gemini-2.5-flash-lite'
const MAX_CONTENT_LENGTH = 50_000

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey?.trim()) {
    return NextResponse.json(
      {
        error:
          'GEMINI_API_KEY가 설정되지 않았습니다. .env.local에 키를 추가한 뒤 서버를 다시 시작하세요.',
      },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 본문입니다.' }, { status: 400 })
  }

  const title =
    typeof (body as { title?: unknown }).title === 'string'
      ? (body as { title: string }).title
      : ''
  const memoId =
    typeof (body as { memoId?: unknown }).memoId === 'string'
      ? (body as { memoId: string }).memoId
      : ''
  let content = (body as { content?: unknown }).content
  let promptTitle = title

  if (memoId) {
    const memo = await getMemoByIdFromDb(memoId)
    if (!memo) {
      return NextResponse.json(
        { error: '요약할 메모를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    promptTitle = memo.title
    content = memo.content
  }

  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json(
      { error: '요약할 메모 본문(content)이 필요합니다.' },
      { status: 400 }
    )
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: `본문은 ${MAX_CONTENT_LENGTH.toLocaleString()}자 이하여야 합니다.` },
      { status: 400 }
    )
  }

  const prompt = `당신은 메모를 간결히 정리하는 도우미입니다.

다음 메모를 한국어로 요약하세요.
- 핵심만 3~7문장 또는 불릿으로 정리합니다.
- 서론·맺음말 없이 요약 본문만 출력합니다.
- 마크다운 문법은 해석해 의미만 반영하고, 요약에는 원문과 같은 서식을 강제하지 않아도 됩니다.

제목: ${promptTitle.trim() || '(제목 없음)'}

본문:
${content}`

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        temperature: 0.35,
        maxOutputTokens: 1024,
      },
    })

    const summary = response.text?.trim()
    if (!summary) {
      return NextResponse.json(
        { error: '모델이 요약 텍스트를 반환하지 않았습니다.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ summary })
  } catch (err) {
    console.error('Gemini summarize error:', err)
    return NextResponse.json(
      { error: '요약을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    )
  }
}
