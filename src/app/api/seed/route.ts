import { NextRequest, NextResponse } from 'next/server'
import { AppDataSource } from '@/db/data-source'
import { hashPassword } from '@/lib/auth'

const getDataSource = async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
    }
    return AppDataSource
}

export async function POST(request: NextRequest) {
    try {
        const dataSource = await getDataSource()

        const userRepository = dataSource.getRepository('User')
        const serviceRepository = dataSource.getRepository('Service')
        const masterServiceRepository = dataSource.getRepository('MasterService')

        // Check if already seeded
        const existingUsers = await userRepository.count()
        if (existingUsers > 0) {
            return NextResponse.json(
                { message: 'Database already seeded' },
                { status: 400 }
            )
        }

        // Create a set of services (на русском)
        const servicesData = [
            { name: 'Замена масла', description: 'Полная замена моторного масла и фильтра', price: 3500 },
            { name: 'Балансировка колёс', description: 'Балансировка всех четырёх колёс', price: 1200 },
            { name: 'Ремонт тормозной системы', description: 'Диагностика и ремонт тормозной системы', price: 8000 },
            { name: 'Замена шин', description: 'Установка новых шин и утилизация старых', price: 15000 },
            { name: 'Диагностика двигателя', description: 'Компьютерная диагностика и проверка систем', price: 4000 },
            { name: 'Ремонт подвески', description: 'Замена амортизаторов и регулировка подвески', price: 9000 },
            { name: 'Шиномонтаж', description: 'Сезонная смена шин и проверка давления', price: 1000 },
            { name: 'Чистка инжектора', description: 'Ультразвуковая чистка форсунок и инжектора', price: 6000 },
            { name: 'Замена свечей зажигания', description: 'Замена и проверка свечей', price: 1500 },
            { name: 'Обслуживание кондиционера', description: 'Проверка, дозаправка и очистка системы кондиционирования', price: 7000 },
            { name: 'Покраска элемента', description: 'Локальная покраска кузовного элемента', price: 5000 },
            { name: 'Компьютерная регулировка развала-схождения', description: 'Настройка геометрии колёс', price: 4500 },
        ]

        const services = servicesData.map((s) => serviceRepository.create({ ...s, isActive: true }))
        await serviceRepository.save(services)

        // Create core users: operator and admin
        const operator1 = userRepository.create({
            fullName: 'Оператор Сергей',
            phone: '+79990000001',
            passwordHash: await hashPassword('operator'),
            role: 'OPERATOR',
        })

        const admin1 = userRepository.create({
            fullName: 'Администратор Михаил',
            phone: '+79990000002',
            passwordHash: await hashPassword('admin'),
            role: 'ADMIN',
        })

        // Create several мастеров
        const mastersData = [
            { fullName: 'Иван Петров', phone: '+79990000101', experienceYears: 12, specialization: 'Двигатель' },
            { fullName: 'Алексей Смирнов', phone: '+79990000102', experienceYears: 8, specialization: 'Подвеска и ходовая' },
            { fullName: 'Елена Кузнецова', phone: '+79990000103', experienceYears: 6, specialization: 'Тормоза и шины' },
            { fullName: 'Дмитрий Иванов', phone: '+79990000104', experienceYears: 10, specialization: 'Электрика и диагностика' },
            { fullName: 'Ольга Николаева', phone: '+79990000105', experienceYears: 5, specialization: 'Кондиционеры и климат' },
            { fullName: 'Сергей Орлов', phone: '+79990000106', experienceYears: 7, specialization: 'Кузовные работы' },
        ]

        const masters = await Promise.all(
            mastersData.map(async (m) =>
                userRepository.create({
                    ...m,
                    passwordHash: await hashPassword('master'),
                    role: 'MASTER',
                })
            )
        )

        // Create a set of клиентов
        const clientsData = Array.from({ length: 20 }).map((_, i) => ({
            fullName: `Клиент ${i + 1}`,
            phone: `+799900002${String(10 + i).padStart(2, '0')}`,
        }))

        const clients = await Promise.all(
            clientsData.map(async (c) =>
                userRepository.create({ ...c, passwordHash: await hashPassword('client'), role: 'CLIENT' })
            )
        )

        await userRepository.save([operator1, admin1, ...masters, ...clients])

        // Associate masters with multiple services
        const masterServiceEntries: any[] = []
        masters.forEach((master, idx) => {
            // give each master 3-6 services
            const assigned = services.slice((idx * 2) % services.length, ((idx * 2) % services.length) + 6)
            assigned.forEach((s) => {
                masterServiceEntries.push(masterServiceRepository.create({ master, service: s }))
            })
        })

        await masterServiceRepository.save(masterServiceEntries)

        // Create many orders with varied statuses and operations
        const orderRepository = dataSource.getRepository('Order')
        const operationRepository = dataSource.getRepository('OrderOperation')

        const allOrders: any[] = []

        // helper to pick random item
        const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

        for (const client of clients) {
            // each client 2-4 orders
            const count = 2 + Math.floor(Math.random() * 3)
            for (let j = 0; j < count; j++) {
                const service = pick(services)
                const master = pick(masters)
                const scheduledAt = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)) // within last 30 days
                const servicePrice = service.price

                // decide status
                const statusRand = Math.random()
                let status: any = 'IN_PROGRESS'
                let finalPrice: number | undefined = undefined
                let cancelReason: string | undefined = undefined
                let completionComment: string | undefined = undefined
                let paidAmount = 0

                if (statusRand < 0.5) {
                    status = 'COMPLETED'
                    // small random extra work/discount
                    const extra = Math.random() < 0.3 ? 500 : 0
                    const discount = Math.random() < 0.2 ? 300 : 0
                    finalPrice = servicePrice + extra - discount
                    completionComment = 'Работа выполнена качественно.'
                    paidAmount = finalPrice
                } else if (statusRand < 0.7) {
                    status = 'CANCELLED'
                    cancelReason = 'Клиент отменил запись'
                    finalPrice = 0
                    paidAmount = 0
                } else {
                    status = 'IN_PROGRESS'
                    // partially paid sometimes
                    if (Math.random() < 0.4) {
                        paidAmount = Math.floor(servicePrice / 2)
                    }
                }

                const order = orderRepository.create({
                    client,
                    service,
                    master,
                    operator: operator1,
                    scheduledAt,
                    servicePrice,
                    discount: 0,
                    extraWork: 0,
                    paidAmount,
                    status,
                    cancelReason,
                    finalPrice,
                    completionComment,
                })

                allOrders.push(order)
            }
        }

        await orderRepository.save(allOrders)

        // Create operations for completed and paid orders
        const savedOrders = await orderRepository.find()
        const operationsToSave: any[] = []
        for (const o of savedOrders) {
            if (o.status === 'COMPLETED' && o.finalPrice && o.finalPrice > 0) {
                operationsToSave.push(
                    operationRepository.create({ order: o, type: 'PAYMENT', amount: o.finalPrice, createdBy: operator1 })
                )
            }
            if (o.status === 'CANCELLED') {
                operationsToSave.push(
                    operationRepository.create({ order: o, type: 'CANCELLATION', reason: o.cancelReason || 'Отмена', createdBy: operator1 })
                )
            }
            if (o.paidAmount && o.paidAmount > 0 && o.status !== 'COMPLETED') {
                operationsToSave.push(
                    operationRepository.create({ order: o, type: 'PAYMENT', amount: o.paidAmount, createdBy: operator1 })
                )
            }
        }

        if (operationsToSave.length > 0) {
            await operationRepository.save(operationsToSave)
        }

        return NextResponse.json(
            {
                message: 'Database seeded successfully',
                summary: {
                    users: {
                        operators: 1,
                        admins: 1,
                        masters: masters.length,
                        clients: clients.length,
                    },
                    services: services.length,
                    orders: savedOrders.length,
                },
                exampleCredentials: {
                    admin: { phone: admin1.phone, password: 'admin' },
                    operator: { phone: operator1.phone, password: 'operator' },
                    master_example: { phone: masters[0]?.phone, password: 'master' },
                    client_example: { phone: clients[0]?.phone, password: 'client' },
                },
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Error seeding database:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to seed database' },
            { status: 500 }
        )
    }
}
