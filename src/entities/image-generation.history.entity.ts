import { BaseEntity } from 'src/common/database/sm-base.entity';
import { Entity, Column } from 'typeorm';

@Entity('image_generation_history')
export class ImageGenerationHistory extends BaseEntity {
  @Column()
  prompt: string;

  @Column()
  imageUrl: string;
}
