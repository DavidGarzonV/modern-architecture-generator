import { ClassProperty } from 'constants/types';
import { convertToPascalCase } from 'utils/string';

/**
 * Create a class content in JavaScript
 * @param name Name of the class
 * @param defaultProperties Default properties of the class
 * @param createSettersAndGetters Create setters and getters for the properties
 */
export const createJsClassContent = (
	name: string,
	defaultProperties?: ClassProperty[],
	createSettersAndGetters?: boolean
): string => {
	let content = `export default class ${convertToPascalCase(name)} {`;

	if (defaultProperties && defaultProperties.length > 0) {
		for (const property of defaultProperties) {
			const propertyName = createSettersAndGetters ? `private _${property.name}` : property.name;
			content += `\n\t${propertyName}: ${property.type}`;
		}

		for (const property of defaultProperties) {
			if (createSettersAndGetters) {
				content += `\n\n\tget ${property.name}(): ${property.type} { return this._${property.name}; }`;
				content += `\n\tset ${property.name}(value: ${property.type}) { this._${property.name} = value; }`;
			}
		}

		content += '\n\n\tconstructor(';
		for (const property of defaultProperties) {
			content += `\n\t\t${property.name}: ${property.type},`;
		}
		content += '\n\t){';

		for (const property of defaultProperties) {
			const propertyName = createSettersAndGetters ? `_${property.name}` : property.name;
			content += `\n\t\tthis.${propertyName} = ${property.name}`;
		}

		content += '\n\t}';
		content += '\n\n\t// Add class methods here';
	} else {
		content += '\n\t// property: string | number | boolean | Date';
	}

	content += '\n}';

	return content;
};

/**
 * Create an interface content in JavaScript
 * @param name Name of the interface
 * @param defaultProperties Default properties of the interface
 */
export const createJsInterfaceContent = (name: string, defaultProperties?: ClassProperty[]): string => {
	let content = `export interface ${name} {`;
	content += '\n\t// Add properties here';

	if (defaultProperties && defaultProperties.length > 0) {
		for (const property of defaultProperties) {
			content += `\n\t${property.name}: ${property.type}`;
		}
	} else {
		content += '\n\t// property: string | number | boolean | Date';
	}

	content += '\n}';
	return content;
};