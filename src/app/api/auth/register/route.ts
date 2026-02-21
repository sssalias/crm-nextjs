import { NextResponse } from 'next/server'
import { initializeDataSource, AppDataSource } from '@/db/data-source'
import { User, Role } from '@/entities/User'
import { hashPassword, signToken, serializeAuthCookie } from '@/lib/auth'

export async function POST(req: Request) {
    const body = await req.json()
    const { fullName, phone, password } = body ?? {}
    if (!fullName || !phone || !password) {
        return new Response(JSON.stringify({ error: 'fullName, phone and password are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    await initializeDataSource()
    const repo = AppDataSource.getRepository(User)
    const exists = await repo.findOne({ where: { phone } })
    if (exists) return new Response(JSON.stringify({ error: 'Phone already in use' }), { status: 409, headers: { 'Content-Type': 'application/json' } })

    const passwordHash = await hashPassword(password)
    const user = repo.create({ fullName, phone, passwordHash, role: Role.CLIENT, isActive: true })
    await repo.save(user)

    const token = signToken({ userId: user.id, role: user.role })
    const cookie = serializeAuthCookie(token)

    const { passwordHash: _ph, ...safe } = user as any
    return new Response(JSON.stringify({ user: safe }), { status: 201, headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie } })
}
