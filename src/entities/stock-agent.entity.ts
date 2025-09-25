import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('runs')
export class Run {
  @PrimaryGeneratedColumn()
  run_id: number;

  @Column('text', { array: true })
  tickers: string[];

  @Column()
  risk_profile: string;

  @Column()
  mode: string;

  @Column({ default: 14 })
  window_days: number;

  @Column('jsonb', { nullable: true })
  decisions: Record<string, any>;

  @Column({ default: 0 })
  num_buys: number;
}