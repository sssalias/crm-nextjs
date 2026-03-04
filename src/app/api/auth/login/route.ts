import { initializeDataSource, AppDataSource } from '@/db/data-source'
import { User } from '@/entities/User'
import { verifyPassword, signToken, serializeAuthCookie } from '@/lib/auth'
import { normalizePhoneForDB } from '@/lib/phone'

export async function POST(req: Request) {
    const body = await req.json()
    const { phone, password } = body ?? {}
    if (!phone || !password) return new Response(JSON.stringify({ error: 'phone and password required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    await initializeDataSource()
    // using entity name string prevents module duplication issues
    const repo = AppDataSource.getRepository('User')
    const normPhone = normalizePhoneForDB(phone)
    const user = await repo.findOne({ where: { phone: normPhone } })
    if (!user) return new Response(JSON.stringify({ error: 'Неверные учетные данные' }), { status: 401, headers: { 'Content-Type': 'application/json' } })

    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) return new Response(JSON.stringify({ error: 'Неверные учетные данные' }), { status: 401, headers: { 'Content-Type': 'application/json' } })

    const token = signToken({ userId: user.id, role: user.role })
    const cookie = serializeAuthCookie(token)

    const { passwordHash: _ph, ...safe } = user as any
    return new Response(JSON.stringify({ user: safe }), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie } })
}
