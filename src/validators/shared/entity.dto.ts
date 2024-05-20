import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class ValidateEntityDTO {
	@IsOptional()
	@IsString()
	@MinLength(5)
	@Matches(/^([a-zA-Z0-9]+\/)?[a-zA-Z0-9]+$/, { 
		message: 'Entity name must be in the format "entity" or "context/entity"'
	})
		entity?: string;
}