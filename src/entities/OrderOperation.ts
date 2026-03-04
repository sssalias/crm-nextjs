import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm'
import { Order } from './Order'
import { User } from './User'

export enum OperationType {
    PAYMENT = 'PAYMENT',
    CANCELLATION = 'CANCELLATION',
}

@Entity({ name: 'order_operations' })
export class OrderOperation {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => Order, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order!: Order

    @Column({ type: 'varchar' })
    type!: OperationType

    @Column({ type: 'integer', nullable: true })
    amount?: number

    @Column({ nullable: true })
    reason?: string

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    createdBy?: User

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt!: Date
}

