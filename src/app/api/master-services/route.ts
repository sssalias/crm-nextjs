import { NextRequest, NextResponse } from 'next/server'
import { AppDataSource } from '@/db/data-source'

const getDataSource = async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
    }
    return AppDataSource
}

export async function GET(request: NextRequest) {
    try {
        const serviceId = request.nextUrl.searchParams.get('serviceId')
        if (!serviceId) return NextResponse.json({ error: 'serviceId required' }, { status: 400 })

        const dataSource = await getDataSource()
        // Use query builder to find masters linked to the service
        const msRepo = dataSource.getRepository('MasterService')

        const rows = await msRepo
            .createQueryBuilder('ms')
            .leftJoinAndSelect('ms.master', 'master')
            .leftJoinAndSelect('ms.service', 'service')
            .where('service.id = :sid', { sid: Number(serviceId) })
            .getMany()

        const masters = rows.map((r: any) => ({ id: r.master.id, fullName: r.master.fullName, phone: r.master.phone }))

        return NextResponse.json({ masters }, { status: 200 })
    } catch (error: any) {
        console.error('Error fetching master-services:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch masters' }, { status: 500 })
    }
}
