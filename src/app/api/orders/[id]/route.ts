import { initializeDataSource, AppDataSource } from '@/db/data-source'
import { requireOperatorWithOpenShift, requireMaster } from '@/lib/guards'
import { Order, OrderStatus } from '@/entities/Order'
import { User, Role } from '@/entities/User'
import { MasterService } from '@/entities/MasterService'

export async function GET(req: Request) {
    const id = String(req.url).split('/').pop() || ''
    await initializeDataSource()
    const repo = AppDataSource.getRepository(Order)
    const order = await repo.findOne({ where: { id: Number(id) }, relations: ['client', 'service', 'master', 'operator', 'operations'] })
    if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    return new Response(JSON.stringify({ order }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export async function PATCH(req: Request) {
    // Only operator with open shift can edit orders
    const { user } = await requireOperatorWithOpenShift(req)
    const id = String(req.url).split('/').pop() || ''
    const body = await req.json()
    const { scheduledAt, masterId, serviceId } = body ?? {}

    await initializeDataSource()
    const orderRepo = AppDataSource.getRepository(Order)
    const userRepo = AppDataSource.getRepository(User)
    const msRepo = AppDataSource.getRepository(MasterService)

    const order = await orderRepo.findOne({ where: { id: Number(id) }, relations: ['service', 'master'] })
    if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    if (order.status === OrderStatus.COMPLETED) return new Response(JSON.stringify({ error: 'Cannot edit a completed order' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    if (order.status === OrderStatus.CANCELLED) return new Response(JSON.stringify({ error: 'Cannot edit a cancelled order' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    if (scheduledAt) {
        const d = new Date(scheduledAt)
        if (Number.isNaN(d.getTime())) return new Response(JSON.stringify({ error: 'Invalid scheduledAt' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        order.scheduledAt = d
    }

    if (serviceId) {
        const svc = await AppDataSource.getRepository('Service').findOne({ where: { id: serviceId } })
        if (!svc) return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
        order.service = svc as any
    }

    if (masterId !== undefined) {
        if (masterId === null) {
            order.master = undefined
        } else {
            const master = await userRepo.findOne({ where: { id: masterId } })
            if (!master) return new Response(JSON.stringify({ error: 'Master not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
            // ensure master can perform service
            const allowed = await msRepo.findOne({ where: { master: { id: master.id }, service: { id: order.service.id } } })
            if (!allowed) return new Response(JSON.stringify({ error: 'Master cannot perform this service' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
            order.master = master
        }
    }

    await orderRepo.save(order)
    return new Response(JSON.stringify({ order }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
