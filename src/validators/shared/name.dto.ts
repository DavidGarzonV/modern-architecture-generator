import { IsString, MinLength } from 'class-validator';

export class ValidateNameDTO{
	@IsString()
	@MinLength(3)
		name!: string;
}