import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import type { User } from './User'
import type { Service } from './Service'

@Entity({ name: 'master_services' })
@Index(['master', 'service'], { unique: true })
export class MasterService {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => require('./User').User, (u: User) => u.masterServices, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'master_id' })
    master!: User

    @ManyToOne(() => require('./Service').Service, (s: Service) => s.masterServices, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'service_id' })
    service!: Service
}
