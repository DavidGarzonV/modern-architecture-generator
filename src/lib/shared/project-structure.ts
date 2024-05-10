import fs from 'fs';
import { FolderItem, FolderStructure } from 'constants/types';
import { createFolder, pathExists } from 'utils/file';
import { ArchitectureManager } from 'lib/shared/architecture-manager';

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

			createFolder(parentPath);

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
				createFolder(contextFolder);
				return contextFolder;
			}
		} catch (error) {
			throw new Error('Could not create context');
		}

		return baseFolder;
	}
}