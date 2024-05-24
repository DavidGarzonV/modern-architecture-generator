import fs from 'fs';
import { FolderItem, FolderStructure } from 'constants/types';
import { createDirectory, pathExists } from 'utils/file';
import { ArchitectureManager } from 'lib/shared/architecture-manager';
import { formatName } from 'utils/string';
import prompts from 'prompts';

export class ProjectStructure {
	private _projectStructure: FolderStructure = [];
	private _architectureManager: ArchitectureManager;

	get projectStructure() {
		return this._projectStructure;
	}

	constructor(){
		this._architectureManager = new ArchitectureManager();
		const architecture = this._architectureManager.architecture;

		const projectPath = process.cwd();
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

		let srcPath = 'src';
		if (process.env.NODE_ENV === 'local') {
			const executionPath = process.cwd();
			srcPath = `${executionPath}/test-environment`;
		}

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

			const { overwrite, newName } = await prompts([
				{
					type: 'confirm',
					name: 'overwrite',
					message: `The ${itemTypes[fileType]} ${name} already exists. Do you want to overwrite it?`,
					initial: false,
				},
				{
					type: (prev) => (!prev ? 'text' : null),
					name: 'newName',
					message: `Enter a new name for the ${itemTypes[fileType]}:`,
				},
			]);

			if (!overwrite) {
				adapterName = formatName(newName);
			}
		}

		return adapterName;
	}
}