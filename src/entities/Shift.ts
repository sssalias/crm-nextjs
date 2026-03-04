import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'

@Entity({ name: 'shifts' })
export class Shift {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'operator_id' })
    operator!: User

    @Column({ name: 'opened_at', type: 'datetime' })
    openedAt!: Date

    @Column({ name: 'closed_at', type: 'datetime', nullable: true })
    closedAt?: Date

    @Column({ name: 'is_closed', default: false })
    isClosed!: boolean
}
