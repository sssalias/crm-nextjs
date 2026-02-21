import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entities/User'
import { Service } from '../entities/Service'
import { MasterService } from '../entities/MasterService'
import { Order, OrderOperation } from '../entities/Order'
import { Shift } from '../entities/Shift'
import { ShiftLog } from '../entities/ShiftLog'


const isDev = process.env.NODE_ENV !== 'production'
const databasePath = process.env.SQLITE_DB_PATH || 'database.sqlite'

declare global {
    // eslint-disable-next-line no-var
    var __appDataSource: DataSource | undefined
}

export const AppDataSource = globalThis.__appDataSource ?? new DataSource({
    type: 'sqlite',
    database: databasePath,
    synchronize: isDev, // use migrations in production
    logging: isDev,
    entities: [User, Service, MasterService, Order, Shift, ShiftLog, OrderOperation],
})

if (!globalThis.__appDataSource) globalThis.__appDataSource = AppDataSource

export async function initializeDataSource() {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize()
    return AppDataSource
}
