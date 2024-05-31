import fs from 'fs';
import prompts from 'prompts';
import path from 'path';
import { FolderItem, FolderStructure } from 'constants/types';
import { createDirectory, findFileFilePath, pathExists } from 'utils/file';
import { capitalize, formatName } from 'utils/string';
import { ArchitectureManager } from 'utils/singleton/architecture-manager';
import { Configuration } from 'utils/singleton/configuration';
import { CustomCommand } from 'utils/singleton/command';
import { EnabledArchitectures } from 'constants/constants';
import Loader from 'utils/loader';

export class ProjectStructure {
	private _projectStructure: FolderStructure = [];

	get projectStructure() {
		return this._projectStructure;
	}

	constructor(){
		this.setProjectStructure();
	}

	/**
	 * @description Set the project structure based on the architecture
	 * @param {EnabledArchitectures} [architecture]
	 */
	setProjectStructure(architecture?: EnabledArchitectures){
		if (!architecture) {
			architecture = ArchitectureManager.getArchitecture();
		}

		const projectPath = Configuration.getMagPath();

		const jsonFile = fs.readFileSync(`${projectPath}/src/templates/folder-structure/${architecture}.json`, 'utf-8');
		const structure = JSON.parse(jsonFile) as FolderStructure;
		this._projectStructure = structure;
	}

	/**
	 * @description Organize the parent folder of a folder item and returns the path
	 * @param {FolderItem} item
	 * @param {string} [basePath='']
	 * @return {*}  {string}
	 * @memberof ProjectStructure
	 */
	organizeParentFolder(item: FolderItem, basePath: string = ''): string {
		if (item.parent) {
			const findParent = this.projectStructure.find((folder) => folder.name === item.parent);
			const parentPath = this.organizeParentFolder(findParent!, basePath);

			createDirectory(parentPath);

			return `${parentPath}/${item.name}`;
		}else{
			return `${basePath}/${item.name}`;
		}
	}

	/**
	 * @description Find the folder path in a local project by name
	 * @param {string} name
	 * @return {*}  {string}
	 * @memberof ProjectStructure
	 */
	findFolderPathByName(name: string): string {
		const itemFolder = this.projectStructure.find((item) => item.name === name);
		if (!itemFolder) {
			throw new Error(`Could not find ${name} folder`);
		}

		const srcPath = CustomCommand.getExecutionPath() + '/src';
		return this.organizeParentFolder(itemFolder, srcPath);
	}

	/**
	 * @description Create a context folder in a base folder like use-cases, entities, etc
	 * @param {string} baseFolder
	 * @param {string} contextName
	 * @return {*}  {string}
	 * @memberof ProjectStructure
	 */
	createContextFolder(baseFolder: string, contextName: string): string {
		try {
			if (pathExists(baseFolder)) {
				const contextFolder = `${baseFolder}/${contextName}`;
				createDirectory(contextFolder);
				return contextFolder;
			}
		} catch (error) {
			throw new Error('Could not create context');
		}

		return baseFolder;
	}

	/**
	 * @description Ask for the creation of a file validating if it already exists
	 * @param {string} baseFileName
	 * @param {string} baseFolder
	 * @param {string} fileType
	 * @return {*}  {Promise<string>}
	 * @memberof ProjectStructure
	 */
	async askForCreateProjectFile(
		baseFileName: string,
		baseFolder: string,
		fileType: 'adapter' | 'repository' | 'port' | 'usecase' | 'entity'
	): Promise<string> {
		const name = formatName(baseFileName);

		let adapterName = name;
		let pathToValidate  = baseFolder;
		if (fileType === 'usecase' || fileType === 'entity') {
			pathToValidate = `${baseFolder}/${name}`;
		}

		if (pathExists(`${pathToValidate}/${name}.${fileType}.ts`)) {
			const itemTypes: Record<typeof fileType, string> = {
				adapter: 'adapter',
				repository: 'interface adapter',
				port: 'port',
				usecase: 'use case',
				entity: 'entity',
			};

			const itemType = itemTypes[fileType];

			Loader.interrupt();

			const { overwrite, newName } = await prompts([
				{
					type: 'confirm',
					name: 'overwrite',
					message: `The ${itemType} ${name} already exists. Do you want to overwrite it?`,
					initial: false,
				},
				{
					type: (prev) => (!prev ? 'text' : null),
					name: 'newName',
					message: `Enter a new name for the ${itemType}:`,
				},
			]);
			Loader.create(`Creating new ${itemType}`, { doneMessage: `${capitalize(itemType)} created!` });

			if (!overwrite) {
				adapterName = formatName(newName);
			}
		}

		return adapterName;
	}

	/**
	 * @description Get the import path from a given origin to a destination
	 * @param {string} origin Folder where the import is going to be made
	 * @param {string} destination File path to be imported
	 * @return {*} {string} Import path
	 */
	getImportPath(origin: string, destination: string): string {
		const finalPath = path.relative(origin, destination).replace(/\\/g, '/');
		return finalPath;
	}

	/**
	 * Gets entity import path from a given entity base path
	 * @param entityPath Entity name or entity path with name
	 * @param baseFolder Folder where the entity is going to be imported
	 * @returns entity import path 
	 */
	getEntityImportPath(entityPath: string, baseFolder: string): string | undefined{
		const entitiesFolder = this.findFolderPathByName('entities');

		let entityFile = `${entityPath}.entity.ts`;
		if (entityPath.includes('/')) {
			entityFile = entityPath;
		}

		const finalEntityPath = findFileFilePath(entitiesFolder, entityFile);

		if (entityPath && finalEntityPath) {
			if (pathExists(finalEntityPath)) {
				return this.getImportPath(baseFolder, finalEntityPath).replace('.ts', '');
			}
		}

		return undefined;
	}
}