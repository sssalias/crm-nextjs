import { parseTokenFromCookieHeader, verifyToken } from './auth'
import { initializeDataSource, AppDataSource } from '@/db/data-source'
import { User } from '@/entities/User'

export async function getUserFromRequest(req: Request): Promise<User | null> {
    const cookieHeader = req.headers.get('cookie') ?? undefined
    const token = parseTokenFromCookieHeader(cookieHeader)
    if (!token) return null

    let payload: any
    try {
        payload = verifyToken(token)
    } catch (err) {
        return null
    }

    if (!payload?.userId) return null

    if (!AppDataSource.isInitialized) await initializeDataSource()
    const repo = AppDataSource.getRepository(User)
    const user = await repo.findOne({ where: { id: payload.userId } })
    return user ?? null
}

export async function requireUser(req: Request) {
    const user = await getUserFromRequest(req)
    if (!user) throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    return user
}
