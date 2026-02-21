import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm'
import type { User } from './User'
import type { Service } from './Service'


export enum OrderStatus {
    CANCELLED = 'CANCELLED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

@Entity({ name: 'orders' })
export class Order {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => require('./User').User, (u: User) => u.clientOrders, { nullable: false })
    @JoinColumn({ name: 'client_id' })
    client!: User

    @ManyToOne(() => require('./Service').Service, (s: Service) => s.orders, { nullable: false })
    @JoinColumn({ name: 'service_id' })
    service!: Service

    @ManyToOne(() => require('./User').User, (u: User) => u.masterOrders, { nullable: true })
    @JoinColumn({ name: 'master_id' })
    master?: User

    @ManyToOne(() => require('./User').User, (u: User) => u.operatorOrders, { nullable: true })
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

    // operations relationship (OrderOperation is declared below to avoid circular import)
    @OneToMany(() => OrderOperation, (op: OrderOperation) => op.order)
    operations!: OrderOperation[]
}


/* Moved OrderOperation into this file to avoid circular import issues */
import { Entity as E2, PrimaryGeneratedColumn as P2, Column as C2, ManyToOne as M2, JoinColumn as J2, CreateDateColumn as CD2 } from 'typeorm'

export enum OperationType {
    PAYMENT = 'PAYMENT',
    CANCELLATION = 'CANCELLATION',
}

@E2({ name: 'order_operations' })
export class OrderOperation {
    @P2()
    id!: number

    @M2(() => Order, (o: Order) => o.operations, { onDelete: 'CASCADE' })
    @J2({ name: 'order_id' })
    order!: Order

    @C2({ type: 'varchar' })
    type!: OperationType

    @C2({ type: 'integer', nullable: true })
    amount?: number

    @C2({ nullable: true })
    reason?: string

    @M2(() => require('./User').User, { nullable: true })
    @J2({ name: 'created_by' })
    createdBy?: User

    @CD2({ name: 'created_at', type: 'datetime' })
    createdAt!: Date
}
