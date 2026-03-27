import 'server-only'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

function getRequiredEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`${name} 환경 변수가 설정되지 않았습니다.`)
  }
  return value
}

export function createSupabaseServerClient() {
  return createClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl),
    getRequiredEnv(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      supabasePublishableKey
    ),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
