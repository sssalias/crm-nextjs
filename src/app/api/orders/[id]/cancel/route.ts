import { initializeDataSource, AppDataSource } from '@/db/data-source'
import { requireOperatorWithOpenShift } from '@/lib/guards'
import { Order, OrderStatus } from '@/entities/Order'
import { OrderOperation, OperationType } from '@/entities/OrderOperation'

export async function POST(req: Request) {
    const { user } = await requireOperatorWithOpenShift(req)
    const id = String(req.url).split('/').slice(-2, -1)[0]
    const body = await req.json()
    const { cancelReason } = body ?? {}
    if (!cancelReason) return new Response(JSON.stringify({ error: 'cancelReason is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    await initializeDataSource()
    const orderRepo = AppDataSource.getRepository(Order)
    const opRepo = AppDataSource.getRepository(OrderOperation)

    const order = await orderRepo.findOne({ where: { id: Number(id) } })
    if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    if (order.status === OrderStatus.COMPLETED) return new Response(JSON.stringify({ error: 'Cannot cancel a completed order' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    if (order.status === OrderStatus.CANCELLED) return new Response(JSON.stringify({ error: 'Order already cancelled' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    order.status = OrderStatus.CANCELLED
    order.cancelReason = cancelReason
    await orderRepo.save(order)

    const op = opRepo.create({ order, type: OperationType.CANCELLATION, reason: cancelReason, createdBy: user })
    await opRepo.save(op)

    return new Response(JSON.stringify({ order }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}