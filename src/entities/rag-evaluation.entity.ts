
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../common/database/sm-base.entity';

@Entity('rag_evaluations')
export class RagEvaluation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  query: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'text', array: true })
  retrieved_contexts: string[];

  @Column({ type: 'text' })
  reference: string;

  @Column({ type: 'float' })
  faithfulness: number;

  @Column({ type: 'float' })
  answer_relevancy: number;

  @Column({ type: 'float' })
  context_precision: number;

  @Column({ type: 'float' })
  context_recall: number;
}
