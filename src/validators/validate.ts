import { ValidationError, validate } from 'class-validator';
import { ClassConstructor, plainToClass } from 'class-transformer';

const errorHandler = (err: ValidationError[]): string => {
	return err.map((item) => {
		if (item.children && item.children.length > 0) {
			const childrenErrors = item.children.map((childrenItem) => {
				const childrenConstraints: string[] = Object.values(childrenItem.constraints ?? {});
				return childrenConstraints.join(' ');
			});

			return childrenErrors;
		} else {
			const constraints: string[] = Object.values(item.constraints ?? {});
			return constraints;
		}
	}).join(' ');
};


export default async function validateDTO(objectToValidate: object, dtoClass: ClassConstructor<unknown>){
	const output = plainToClass(dtoClass, objectToValidate);

	const validateResponse = await validate(output as object);
	const errors = errorHandler(validateResponse);

	if (errors && errors.length > 0) {
		throw new Error(`Invalid data provided -> ${errors}`);
	}
}