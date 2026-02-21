import { initializeDataSource, AppDataSource } from '@/db/data-source'
import { requireMaster } from '@/lib/guards'
import { Order, OrderStatus } from '@/entities/Order'

export async function POST(req: Request) {
    const master = await requireMaster(req)
    const id = String(req.url).split('/').slice(-2, -1)[0]

    await initializeDataSource()
    const orderRepo = AppDataSource.getRepository(Order)
    const order = await orderRepo.findOne({ where: { id: Number(id) }, relations: ['master'] })
    if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })

    if (!order.master || order.master.id !== master.id) return new Response(JSON.stringify({ error: 'Forbidden - not your order' }), { status: 403, headers: { 'Content-Type': 'application/json' } })

    order.status = OrderStatus.IN_PROGRESS
    await orderRepo.save(order)

    return new Response(JSON.stringify({ order }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}