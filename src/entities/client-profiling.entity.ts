import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('client-profiling') 
export class ClientProfiling {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  attendee_name: string;

  @Column()
  title: string;

  @Column()
  organization: string;

  @Column({ type: 'date', nullable: true })
  meeting_date: Date;

  @Column({ default: 'TechCorp' })
  our_company: string;

  @Column({
    type: 'text',
    array: true,
    default: () => "ARRAY['AI Solutions', 'Digital Transformation']",
  })
  our_solutions: string[];

  // --- From MeetingBrief ---
  @Column({ type: 'jsonb', nullable: true })
  prospect_info: Record<string, string>;

  @Column({ type: 'text', array: true, nullable: true })
  key_pitch_points: string[];

  @Column({ type: 'text', array: true, nullable: true })
  background_education: string[];

  @Column({ type: 'text', array: true, nullable: true })
  recent_highlights: string[];

  @Column({ type: 'text', array: true, nullable: true })
  portfolio_departments: string[];

  @Column({ type: 'text', array: true, nullable: true })
  major_initiatives: string[];
  
  @Column({ type: 'text', array: true, nullable: true })
  connection_opportunities: string[];

  @Column({ type: 'jsonb', nullable: true })
  data_sources: Record<string, boolean>;

  @Column({ type: 'jsonb', nullable: true })
  scraping_summary: Record<string, number>;

  @Column({ type: 'timestamp', nullable: true })
  generated_at: Date;

  @Column({ type: 'float', nullable: true })
  confidence_score: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
