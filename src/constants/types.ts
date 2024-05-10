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

export enum TypescriptFileFilterMethods {
	Methods = 'methods',
	Properties = 'properties'
}

export type TypescriptFileType = 'type' | 'interface' | 'class'

export type TypescriptDeclarationType = {
	name: string
	type: string
}

export type TypescriptInterfaceType = {
	name: string
	declarations: TypescriptDeclarationType[]
}

export type TypescriptFileResponse = {
	interfaces: TypescriptInterfaceType[]
	classes: string[]
	functions: string[]
	text: string
}