import { IsOptional, IsString, Validate } from 'class-validator';
import { IsValidExistingDirectory } from 'validators/custom/directory';

export class ValidatePathDTO{
	@IsOptional()
	@IsString()
	@Validate(IsValidExistingDirectory)
		path?: string;
}