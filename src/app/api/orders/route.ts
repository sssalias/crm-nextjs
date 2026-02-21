import { initializeDataSource, AppDataSource } from '@/db/data-source'
import { requireOperatorWithOpenShift, optionallyGetUser } from '@/lib/guards'
import { User, Role } from '@/entities/User'
import { Service } from '@/entities/Service'
import { MasterService } from '@/entities/MasterService'
import { Order, OrderStatus } from '@/entities/Order'

export async function POST(req: Request) {
    // Create order — operator only and must have open shift
    const { user } = await requireOperatorWithOpenShift(req)
    const body = await req.json()
    const { clientId, serviceId, masterId, scheduledAt, discount, extraWork } = body ?? {}

    if (!clientId || !serviceId || !scheduledAt) {
        return new Response(JSON.stringify({ error: 'clientId, serviceId and scheduledAt are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    await initializeDataSource()
    const userRepo = AppDataSource.getRepository(User)
    const serviceRepo = AppDataSource.getRepository(Service)
    const msRepo = AppDataSource.getRepository(MasterService)
    const orderRepo = AppDataSource.getRepository(Order)

    const client = await userRepo.findOne({ where: { id: clientId } })
    if (!client) return new Response(JSON.stringify({ error: 'Client not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })

    const service = await serviceRepo.findOne({ where: { id: serviceId } })
    if (!service) return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })

    let master: User | undefined = undefined
    if (masterId) {
        const m = await userRepo.findOne({ where: { id: masterId } })
        if (!m) return new Response(JSON.stringify({ error: 'Master not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
        master = m

        // check master can perform service
        const allowed = await msRepo.findOne({ where: { master: { id: master.id }, service: { id: service.id } } })
        if (!allowed) return new Response(JSON.stringify({ error: 'Master cannot perform this service' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const scheduled = new Date(scheduledAt)
    if (Number.isNaN(scheduled.getTime())) return new Response(JSON.stringify({ error: 'Invalid scheduledAt' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    const order = orderRepo.create({
        client,
        service,
        master: master ?? undefined,
        operator: user,
        scheduledAt: scheduled,
        status: OrderStatus.IN_PROGRESS,
        servicePrice: service.price,
        discount: discount ?? 0,
        extraWork: extraWork ?? 0,
        paidAmount: 0,
    })
    await orderRepo.save(order)

    return new Response(JSON.stringify({ success: true, order }), { status: 201, headers: { 'Content-Type': 'application/json' } })
}

export async function GET(req: Request) {
    // List orders — behavior depends on role
    const maybeUser = await optionallyGetUser(req)
    await initializeDataSource()
    const orderRepo = AppDataSource.getRepository(Order)
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const masterId = url.searchParams.get('masterId')
    const operatorId = url.searchParams.get('operatorId')
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')

    if (!maybeUser) {
        // anonymous users cannot list orders
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    const user = maybeUser
    // Build filters
    const where: any = {}
    if (status) where.status = status
    if (masterId) where.master = { id: Number(masterId) }
    if (operatorId) where.operator = { id: Number(operatorId) }

    // date range on scheduledAt
    const qb = orderRepo.createQueryBuilder('order').leftJoinAndSelect('order.client', 'client').leftJoinAndSelect('order.service', 'service').leftJoinAndSelect('order.master', 'master').leftJoinAndSelect('order.operator', 'operator')

    if (maybeUser) {
        const user = maybeUser
        if (user.role === Role.MASTER) {
            qb.andWhere('master.id = :mid', { mid: user.id })
        } else if (user.role === Role.CLIENT) {
            qb.andWhere('client.id = :cid', { cid: user.id })
        }
    }

    if (where.status) qb.andWhere('order.status = :status', { status: where.status })
    if (where.master) qb.andWhere('master.id = :midFilter', { midFilter: where.master.id })
    if (where.operator) qb.andWhere('operator.id = :oidFilter', { oidFilter: where.operator.id })
    if (dateFrom) qb.andWhere('order.scheduledAt >= :from', { from: dateFrom })
    if (dateTo) qb.andWhere('order.scheduledAt <= :to', { to: dateTo })

    const orders = await qb.getMany()
    return new Response(JSON.stringify({ orders }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
