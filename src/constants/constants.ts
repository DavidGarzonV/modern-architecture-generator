import { ConfigurationOptions } from 'constants/types';

export enum EnabledArchitectures{
	Clean = 'clean',
	Hexagonal = 'hexagonal'
}

export const ARCHITECTURE_KEYWORDS = {
	[EnabledArchitectures.Clean]: ['clean-architecture', 'nodejs', 'typescript'],
	[EnabledArchitectures.Hexagonal]: ['hexagonal-architecture', 'nodejs', 'typescript'],
};

export const README_PATH = 'templates/readme';
export const README_PUBLIC_PATH = `${README_PATH}/public`;

export const enabledConfigurationKeys: ConfigurationOptions[] = [
	'architecture',
	'useCasesFolder',
	'usePascalCase',
	'useCamelCase',
	'filesEOL',
];

export const arquitectureChoices = [
	{ title: 'Clean Architecture', value: EnabledArchitectures.Clean },
	{ title: 'Hexagonal Architecture', value: EnabledArchitectures.Hexagonal },
];

export const unitTestingFrameworkChoices = [
	{ title: 'Jest', value: 'jest' },
	{ title: 'Mocha', value: 'mocha' },
	{ title: 'Jasmine', value: 'jasmine' },
];

const stringIcons = {
	main: {
		tick: '✔',
		cross: '✖',
	},
	win: {
		tick: '√',
		cross: '×',
	}
};

export const icons = process.platform === 'win32' ? stringIcons.win : stringIcons.main;	