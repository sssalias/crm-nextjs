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
        const role = request.nextUrl.searchParams.get('role')

        const dataSource = await getDataSource()
        const userRepository = dataSource.getRepository('User')

        let query = userRepository.createQueryBuilder('user')

        if (role) {
            query = query.where('user.role = :role', { role })
        }

        const users = await query.orderBy('user.fullName', 'ASC').getMany()

        // Remove sensitive data
        const safeUsers = users.map((user: any) => ({
            id: user.id,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
        }))

        return NextResponse.json({ users: safeUsers }, { status: 200 })
    } catch (error: any) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch users' },
            { status: 500 }
        )
    }
}
