import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
    const cookie = clearAuthCookie()
    return new Response(null, { status: 204, headers: { 'Set-Cookie': cookie } })
}
