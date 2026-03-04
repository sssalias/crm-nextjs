import { initializeDataSource, AppDataSource } from '@/db/data-source'
import { requireOperatorWithOpenShift, requireMaster } from '@/lib/guards'
import { Order, OrderStatus } from '@/entities/Order'
import { OrderOperation, OperationType } from '@/entities/OrderOperation'
import { User, Role } from '@/entities/User'

async function getCurrentUserAndRole(req: Request): Promise<{ user: User; viaOperatorShift?: boolean }> {
    // prefer operator-with-open-shift (for operator flows), otherwise require master
    try {
        const ctx = await requireOperatorWithOpenShift(req)
        return { user: ctx.user, viaOperatorShift: true }
    } catch (err) {
        const master = await requireMaster(req)
        return { user: master, viaOperatorShift: false }
    }
}

export async function POST(req: Request) {
    const id = String(req.url).split('/').slice(-2, -1)[0]
    const body = await req.json()
    const { finalPrice, completionComment } = body ?? {}
    if (finalPrice === undefined || finalPrice === null) return new Response(JSON.stringify({ error: 'finalPrice is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    const { user } = await getCurrentUserAndRole(req)

    await initializeDataSource()
    const orderRepo = AppDataSource.getRepository(Order)
    const opRepo = AppDataSource.getRepository(OrderOperation)

    const order = await orderRepo.findOne({ where: { id: Number(id) }, relations: ['master'] })
    if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    if (order.status === OrderStatus.CANCELLED) return new Response(JSON.stringify({ error: 'Cannot complete a cancelled order' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    if (order.status === OrderStatus.COMPLETED) return new Response(JSON.stringify({ error: 'Order already completed' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    // if the actor is a master, ensure they are assigned to this order
    if (user.role === Role.MASTER) {
        if (!order.master || order.master.id !== user.id) return new Response(JSON.stringify({ error: 'Forbidden - not the assigned master' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    }

    order.finalPrice = finalPrice
    order.completionComment = completionComment
    order.status = OrderStatus.COMPLETED
    // apply optional adjustments
    if (typeof body.discount === 'number') order.discount = body.discount
    if (typeof body.extraWork === 'number') order.extraWork = body.extraWork
    await orderRepo.save(order)

    // create payment operation for final price (this represents accepting final payment)
    const op = opRepo.create({ order, type: OperationType.PAYMENT, amount: Number(finalPrice), createdBy: user })
    await opRepo.save(op)

    // update cached paid amount
    order.paidAmount = (order.paidAmount || 0) + Number(finalPrice)
    await orderRepo.save(order)

    return new Response(JSON.stringify({ order }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}