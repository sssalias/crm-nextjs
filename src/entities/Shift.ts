import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import type { User } from './User'
import type { ShiftLog } from '@/entities/ShiftLog'

@Entity({ name: 'shifts' })
export class Shift {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => require('./User').User, (u: User) => u.shifts, { nullable: false })
    @JoinColumn({ name: 'operator_id' })
    operator!: User

    @Column({ name: 'opened_at', type: 'datetime' })
    openedAt!: Date

    @Column({ name: 'closed_at', type: 'datetime', nullable: true })
    closedAt?: Date

    @Column({ name: 'is_closed', default: false })
    isClosed!: boolean

    @OneToMany(() => require('@/entities/ShiftLog').ShiftLog, (log: ShiftLog) => log.shift)
    logs!: ShiftLog[]
}
