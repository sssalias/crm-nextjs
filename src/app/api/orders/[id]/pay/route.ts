import { initializeDataSource, AppDataSource } from '@/db/data-source'
import { requireOperatorWithOpenShift } from '@/lib/guards'
import { Order } from '@/entities/Order'
import { OrderOperation, OperationType } from '@/entities/Order'

export async function POST(req: Request) {
    const { user } = await requireOperatorWithOpenShift(req)
    const id = String(req.url).split('/').slice(-3, -2)[0]
    const body = await req.json()
    const { amount } = body ?? {}
    if (amount === undefined || amount === null || Number(amount) <= 0) return new Response(JSON.stringify({ error: 'amount is required and must be > 0' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    await initializeDataSource()
    const orderRepo = AppDataSource.getRepository(Order)
    const opRepo = AppDataSource.getRepository(OrderOperation)

    const order = await orderRepo.findOne({ where: { id: Number(id) } })
    if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    if (order.status === 'CANCELLED') return new Response(JSON.stringify({ error: 'Cannot pay a cancelled order' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    if (order.status === 'COMPLETED') return new Response(JSON.stringify({ error: 'Cannot pay a completed order' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    const intAmount = Number(amount)
    const op = opRepo.create({ order, type: OperationType.PAYMENT, amount: intAmount, createdBy: user })
    await opRepo.save(op)

    // update cached paidAmount
    order.paidAmount = (order.paidAmount || 0) + intAmount
    await orderRepo.save(order)

    return new Response(JSON.stringify({ op, paidAmount: order.paidAmount }), { status: 201, headers: { 'Content-Type': 'application/json' } })
}
