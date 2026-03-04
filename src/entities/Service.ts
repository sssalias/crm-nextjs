import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm'

@Entity({ name: 'services' })
export class Service {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column({ nullable: true })
    description?: string

    // price stored as integer (cents) — change if you prefer decimal
    @Column({ type: 'integer' })
    price!: number

    @Column({ name: 'is_active', default: true })
    isActive!: boolean

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt!: Date
}
