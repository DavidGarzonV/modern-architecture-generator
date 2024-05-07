import { EnabledArchitectures } from 'constants/constants';

export type MagConfiguration = {
	architecture: EnabledArchitectures
	usePascalCase?: boolean | undefined
	useCamelCase?: boolean | undefined
	useCasesFolder?: string | undefined
}

export type ConfigurationOptions = keyof MagConfiguration;

export type FolderItem = {
	name: string
	parent?: string | undefined
}

export type FolderStructure = Array<FolderItem>