import { getProjectConfiguration } from 'utils/config';

export const convertToPascalCase = (str: string): string => {
	if (str.includes('_')) {
		return str
			.split('_')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join('');
	}

	if (str.includes(' ')) {
		return str
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join('');
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
};

export const convertToSnakeCase = (str: string): string => {
	if (/^[A-Za-z]*$/.test(str)) {
		return str
			.replace(/\.?([A-Z]+)/g, (_, y) => '_' + y.toLowerCase())
			.replace(/^_/, '');
	}

	if (str.includes(' ')) {
		return str
			.toLowerCase()
			.split(' ')
			.join('_');
	}

	return str;
};

export const convertToCamelCase = (str: string): string => {
	if (str.includes(' ')) {
		return str
			.toLowerCase()
			.split(' ')
			.map((word, index) => index !== 0 ? word[0].toUpperCase() + word.slice(1) : word)
			.join('');
	}

	if (str === str.charAt(0).toUpperCase() + str.slice(1)) {
		return str.charAt(0).toLowerCase() + str.slice(1);
	}

	return str
		.split('_')
		.map((word, index) => index !== 0 ? word[0].toUpperCase() + word.slice(1) : word)
		.join('');
};

export const formatName = (str: string): string => {
	const config = getProjectConfiguration();
	str = str.replace(/[^a-zA-Z0-9 ]/g, '');

	if (config.usePascalCase) {
		str = convertToPascalCase(str);
	}

	return str;
};

export const formatNameAttributes = (str: string): string => {
	const config = getProjectConfiguration();
	let finalStr = str.replace(/[^a-zA-Z0-9 ]/g, '');

	if (config.useCamelCase) {
		finalStr = convertToCamelCase(finalStr);
	}else{
		finalStr = convertToSnakeCase(finalStr);
	}

	return finalStr;
};