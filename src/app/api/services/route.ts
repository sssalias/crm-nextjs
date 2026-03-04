import { NextRequest, NextResponse } from 'next/server'
import { AppDataSource } from '@/db/data-source'
import { Service } from '@/entities/Service'

const getDataSource = async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
    }
    return AppDataSource
}

export async function GET(request: NextRequest) {
    try {
        const dataSource = await getDataSource()
        const serviceRepository = dataSource.getRepository(Service)

        const services = await serviceRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        })

        return NextResponse.json({ services }, { status: 200 })
    } catch (error: any) {
        console.error('Error fetching services:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch services' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, description, price } = await request.json()

        if (!name || price === undefined) {
            return NextResponse.json(
                { error: 'Name and price are required' },
                { status: 400 }
            )
        }

        const dataSource = await getDataSource()
        const serviceRepository = dataSource.getRepository(Service)

        const service = serviceRepository.create({
            name,
            description: description || '',
            price: Math.round(price * 100), // Convert to cents
            isActive: true,
        })

        await serviceRepository.save(service)

        return NextResponse.json({ service }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating service:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create service' },
            { status: 500 }
        )
    }
}
