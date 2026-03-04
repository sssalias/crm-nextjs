import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { User } from './User'
import { Service } from './Service'

@Entity({ name: 'master_services' })
@Index(['master', 'service'], { unique: true })
export class MasterService {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'master_id' })
    master!: User

    @ManyToOne(() => Service, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'service_id' })
    service!: any
}
