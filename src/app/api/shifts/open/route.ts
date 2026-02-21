import { initializeDataSource, AppDataSource } from '@/db/data-source'
import { requireOperator } from '@/lib/guards'
import { Shift } from '@/entities/Shift'
import { ShiftLog, ShiftAction } from '@/entities/ShiftLog'

export async function POST(req: Request) {
    const user = await requireOperator(req)
    await initializeDataSource()
    const shiftRepo = AppDataSource.getRepository(Shift)

    const existing = await shiftRepo.findOne({ where: { operator: { id: user.id }, isClosed: false } })
    if (existing) return new Response(JSON.stringify({ error: 'Shift already open' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    const shift = shiftRepo.create({ operator: user, openedAt: new Date(), isClosed: false })
    await shiftRepo.save(shift)

    const logRepo = AppDataSource.getRepository(ShiftLog)
    const log = logRepo.create({ shift, action: ShiftAction.OPEN, timestamp: new Date(), operator: user })
    await logRepo.save(log)

    return new Response(JSON.stringify({ shift }), { status: 201, headers: { 'Content-Type': 'application/json' } })
}