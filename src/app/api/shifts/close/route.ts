import { initializeDataSource, AppDataSource } from '@/db/data-source'
import { requireOperator } from '@/lib/guards'
import { Shift } from '@/entities/Shift'
import { ShiftLog, ShiftAction } from '@/entities/ShiftLog'

export async function POST(req: Request) {
    const user = await requireOperator(req)
    await initializeDataSource()
    const shiftRepo = AppDataSource.getRepository(Shift)

    const openShift = await shiftRepo.findOne({ where: { operator: { id: user.id }, isClosed: false } })
    if (!openShift) return new Response(JSON.stringify({ error: 'No open shift to close' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    openShift.closedAt = new Date()
    openShift.isClosed = true
    await shiftRepo.save(openShift)

    const logRepo = AppDataSource.getRepository(ShiftLog)
    const log = logRepo.create({ shift: openShift, action: ShiftAction.CLOSE, timestamp: new Date(), operator: user })
    await logRepo.save(log)

    return new Response(JSON.stringify({ shift: openShift }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}