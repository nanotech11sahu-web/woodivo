import { IsString, MinLength } from 'class-validator';

export class DeleteMediaDto {
  @IsString()
  @MinLength(1)
  publicId!: string;
}
