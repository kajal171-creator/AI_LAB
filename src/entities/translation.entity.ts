import { BaseEntity } from 'src/common/database/sm-base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { AiModelType } from 'src/common/enums/role.enum';

@Entity('rag_translation')
export class Translation extends BaseEntity {
  @Column({
    type: 'varchar',
    name: 'source_language',
    nullable: false,
  })
  sourceLanguage: string;

  @Column({
    type: 'varchar',
    name: 'target_language',
    nullable: false,
  })
  targetLanguage: string;

  @Column({
    type: 'text',
    name: 'original_text',
    nullable: false,
  })
  text: string;

  @Column({
    type: 'text',
    name: 'translated_text',
    nullable: true,
  })
  translatedText: string;

  @Column({
    type: 'varchar',
    name: 'style',
    nullable: false,
  })
  style: string;

  @Column({
    type: 'enum',
    enum: AiModelType,
    default: AiModelType.GPT_4O_MINI,
  })
  aiModelType: AiModelType;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
