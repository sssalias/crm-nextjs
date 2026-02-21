import { NextRequest, NextResponse } from 'next/server'
import { AppDataSource } from '@/db/data-source'
import { getUserFromRequest } from '@/lib/session'

const getDataSource = async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
    }
    return AppDataSource
}

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dataSource = await getDataSource()
        const shiftRepository = dataSource.getRepository('Shift')

        // Get shifts for current operator (filter by relation)
        const shifts = await shiftRepository.find({
            where: { operator: { id: user.id } },
            order: { openedAt: 'DESC' },
        })

        return NextResponse.json({ shifts }, { status: 200 })
    } catch (error: any) {
        console.error('Error fetching shifts:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch shifts' },
            { status: 500 }
        )
    }
}
