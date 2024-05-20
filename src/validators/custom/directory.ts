import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { validatePath } from 'utils/file';

@ValidatorConstraint({ name: 'isValidExistingDirectory', async: false })
export class IsValidExistingDirectory implements ValidatorConstraintInterface {
	validate(value: string) {
		try {
			validatePath(value);
			return true;
		} catch (error) {
			return false;
		}
	}

	defaultMessage() {
		return 'The path is not a valid directory.';
	}
}