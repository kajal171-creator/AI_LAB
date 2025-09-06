import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/database/sm-base.entity';
import { User } from './user.entity';

// Helper classes for JSONB columns
export class KeywordAnalysis {
  score: number;
  matched: string[];
  missing: string[];
  total_jd_keywords: number;
  matched_count: number;
}

export class DetailedScores {
  technical_skills: number;
  experience_relevance: number;
  role_alignment: number;
  strengths: string[];
  gaps: string[];
  summary: string;
}

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
    nullable: false,
  })
  resumeLink: string;

  @Column({
    type: 'float',
    nullable: false,
  })
  score: number;

  @Column({
    type: 'text',
    nullable: true, // This will store the summary
  })
  justification: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileName: string;

  @Column({ type: 'int', nullable: true })
  rank: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recommendation: string;

  @Column({ type: 'float', nullable: true })
  semantic_similarity: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  confidence: string;

  @Column({ type: 'simple-array', nullable: true })
  strengths: string[];

  @Column({ type: 'simple-array', nullable: true })
  gaps: string[];

  @Column({ type: 'jsonb', nullable: true })
  keyword_analysis: KeywordAnalysis;

  @Column({ type: 'jsonb', nullable: true })
  detailed_scores: DetailedScores;

  @Column({ type: 'varchar', length: 100, nullable: true })
  stability: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  suggested_profile: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
