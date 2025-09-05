import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/database/sm-base.entity';
import { User } from './user.entity';
import { JoinColumn,ManyToOne } from 'typeorm';

@Entity('resume_analyses')
export class ResumeAnalysis extends BaseEntity {
  @Column({
    type: 'text',
    nullable: false,
    })
    description:string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
    })
  candidateName: string;

  @Column({ 
    type: 'text',
    nullable: false
     })
  resumeLink: string;

  @Column({
    type: 'float',
      nullable: false
     })
  score: number;

  @Column({
     type: 'text', 
     nullable: false
     })
  justification: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user:User;
}
