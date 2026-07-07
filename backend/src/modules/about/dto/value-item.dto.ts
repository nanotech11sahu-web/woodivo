import { IsString, MaxLength } from 'class-validator';

export class ValueItemDto {
  @IsString()
  @MaxLength(80)
  title!: string;

  @IsString()
  @MaxLength(300)
  description!: string;
}
