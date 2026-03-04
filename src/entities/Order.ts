import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm'
import { User } from './User'
import { Service } from './Service'


export enum OrderStatus {
    CANCELLED = 'CANCELLED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

@Entity({ name: 'orders' })
export class Order {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'client_id' })
    client!: User

    @ManyToOne(() => Service, { nullable: true })
    @JoinColumn({ name: 'service_id' })
    service!: Service

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'master_id' })
    master?: User

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'operator_id' })
    operator?: User

    @Column({ name: 'scheduled_at', type: 'datetime' })
    scheduledAt!: Date

    // snapshot of service price at time of order (cents)
    @Column({ name: 'service_price', type: 'integer' })
    servicePrice!: number

    // financial adjustments (cents)
    @Column({ type: 'integer', nullable: true, default: 0 })
    discount?: number

    @Column({ name: 'extra_work', type: 'integer', nullable: true, default: 0 })
    extraWork?: number

    // cached paid amount (sum of PAYMENT operations), kept in cents
    @Column({ name: 'paid_amount', type: 'integer', default: 0 })
    paidAmount!: number

    @Column({ type: 'varchar', default: OrderStatus.IN_PROGRESS })
    status!: OrderStatus

    @Column({ name: 'cancel_reason', nullable: true })
    cancelReason?: string

    @Column({ name: 'final_price', type: 'integer', nullable: true })
    finalPrice?: number

    @Column({ name: 'completion_comment', nullable: true })
    completionComment?: string

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt!: Date

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt!: Date
}
