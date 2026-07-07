import { IsString, MaxLength } from 'class-validator';

export class SpecificationItemDto {
  @IsString()
  @MaxLength(120)
  key!: string;

  @IsString()
  @MaxLength(500)
  value!: string;
}
