import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'

export enum Role {
    OPERATOR = 'OPERATOR',
    MASTER = 'MASTER',
    CLIENT = 'CLIENT',
    ADMIN = 'ADMIN',
}

@Entity({ name: 'users' })
@Index(['phone'], { unique: true })
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'full_name' })
    fullName!: string

    @Column({ unique: true })
    phone!: string

    @Column({ nullable: true })
    email?: string

    @Column({ name: 'password_hash' })
    passwordHash!: string

    @Column({ type: 'varchar', default: Role.OPERATOR })
    role!: Role

    @Column({ name: 'is_active', default: true })
    isActive!: boolean

    // master-specific optional fields
    @Column({ name: 'experience_years', type: 'integer', nullable: true })
    experienceYears?: number

    @Column({ name: 'specialization', nullable: true })
    specialization?: string

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt!: Date
}
