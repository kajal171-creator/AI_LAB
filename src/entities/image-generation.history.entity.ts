import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('image_generation_history')
export class ImageGenerationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prompt: string;

  @Column()
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
