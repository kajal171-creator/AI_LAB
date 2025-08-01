import { Entity, ManyToMany } from 'typeorm';
import { BaseEntity } from 'src/common/database/sm-base.entity';
import { Column } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('rag_knowledge')
export class Knowledge extends BaseEntity {
  @Column({
    type: 'varchar',
    name: 'url',
    nullable: false,
  })
  url: string;

  @ManyToMany(() => Conversation, (conversation) => conversation.knowledge)
  conversations: Conversation[];
}
