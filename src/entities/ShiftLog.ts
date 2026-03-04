import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Shift } from './Shift'
import { User } from './User'

export enum ShiftAction {
    OPEN = 'OPEN',
    CLOSE = 'CLOSE',
}

@Entity({ name: 'shift_logs' })
export class ShiftLog {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => Shift, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'shift_id' })
    shift!: Shift

    @Column({ type: 'varchar' })
    action!: ShiftAction

    @Column({ type: 'datetime' })
    timestamp!: Date

    @ManyToOne(() => require('./User').User, { nullable: false })
    @JoinColumn({ name: 'operator_id' })
    operator!: User
}
