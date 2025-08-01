import { BaseEntity } from 'src/common/database/sm-base.entity';
import { Entity, Column } from 'typeorm';
import { User } from './user.entity';
import { ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { UserRole } from 'src/common/enums/role.enum';

@Entity('rag_messages')
export class Message extends BaseEntity {
  @Column({
    type: 'text',
    name: 'content',
    nullable: false,
  })
  content: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'varchar',
    name: 'sender_id',
    nullable: false,
  })
  senderId: string;

  @Column({
    type: 'varchar',
    name: 'reciver_id',
    nullable: false,
  })
  reciverId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;
}
