import { getUserFromRequest } from '@/lib/session'

export async function GET(req: Request) {
    const user = await getUserFromRequest(req)
    if (!user) return new Response(JSON.stringify({ user: null }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    const { passwordHash: _ph, ...safe } = user as any
    return new Response(JSON.stringify({ user: safe }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
