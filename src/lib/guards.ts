import { requireUser, getUserFromRequest } from './session'
import { AppDataSource, initializeDataSource } from '@/db/data-source'
import { Shift } from '@/entities/Shift'
import { Role, User } from '@/entities/User'

export async function requireOperatorWithOpenShift(req: Request) {
    const user = await requireUser(req)
    if (user.role !== Role.OPERATOR && user.role !== Role.ADMIN) {
        throw new Response(JSON.stringify({ error: 'Forbidden - operator role required' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    }

    if (!AppDataSource.isInitialized) await initializeDataSource()
    const shiftRepo = AppDataSource.getRepository(Shift)
    const openShift = await shiftRepo.findOne({ where: { operator: { id: user.id }, isClosed: false } })
    if (!openShift) {
        throw new Response(JSON.stringify({ error: 'No open shift for operator' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    }
    return { user, shift: openShift }
}

export async function requireOperator(req: Request) {
    const user = await requireUser(req)
    if (user.role !== Role.OPERATOR && user.role !== Role.ADMIN) {
        throw new Response(JSON.stringify({ error: 'Forbidden - operator role required' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    }
    return user
}

export async function requireMaster(req: Request) {
    const user = await requireUser(req)
    if (user.role !== Role.MASTER) {
        throw new Response(JSON.stringify({ error: 'Forbidden - master role required' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    }
    return user as User
}

export async function optionallyGetUser(req: Request) {
    return getUserFromRequest(req)
}
