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

	findFolderPathByName(name: string): string {
		const itemFolder = this.projectStructure.find((item) => item.name === name);
		if (!itemFolder) {
			throw new Error(`Could not find ${name} folder`);
		}

		const executionPath = process.cwd();
		const srcPath = `${executionPath}/src`;

		return this.organizeParentFolder(itemFolder, srcPath);
	}

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