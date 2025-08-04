import { Entity, Column, ManyToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/database/sm-base.entity';
import { Conversation } from './conversation.entity';
import { User } from './user.entity'; // Adjust import path as needed

@Entity('rag_knowledge')
export class Knowledge extends BaseEntity {
  @Column({
    type: 'varchar',
    name: 'url',
    nullable: false,
  })
  url: string;

  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: false,
  })
  userId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Conversation, (conversation) => conversation.knowledge)
  conversations: Conversation[];
}
