import { BaseEntity } from 'src/common/database/sm-base.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';
import { Knowledge } from './knowledge.entity';

@Entity('rag_conversations')
export class Conversation extends BaseEntity {
  @Column({
    length: 255,
    nullable: true,
  })
  title?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ai_user_id' })
  aiUser: User;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages: Message[];

  @ManyToMany(() => Knowledge, (knowledge) => knowledge.conversations, {
    cascade: true,
  })
  @JoinTable({
    name: 'conversation_knowledge_map',
    joinColumn: { name: 'conversation_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'knowledge_id', referencedColumnName: 'id' },
  })
  knowledge: Knowledge[];
}
