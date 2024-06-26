import { ProjectStructure } from 'lib/shared/project-structure';
import { createDirectory, writeFile } from 'utils/file';
import Loader from 'node-cli-loader';
import { formatName } from 'utils/string';

export type Property = {
	name: string
	type: string
}

type CreateEntityOptions = {
	name: string
	contextName?: string
	useClass?: boolean
	defaultProperties?: Property[]
}

export default class CreateEntity{
	private _entitiesFolder: string = '';
	private _ps: ProjectStructure;

	constructor(){
		this._ps = new ProjectStructure();
	}

	private setEntitiesFolder(): void {
		const defaultEntitiesFolder = this._ps.findFolderPathByName('entities');
		this._entitiesFolder = defaultEntitiesFolder;
	}

	private getFileContent(name: string, defaultProperties?: Property[]){
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
	}

	private async createFile(name: string,defaultProperties?: Property[]): Promise<void> {
		const entityName = await this._ps.askForCreateProjectFile(name, this._entitiesFolder, 'entity');
		const content = this.getFileContent(entityName, defaultProperties);
		createDirectory(`${this._entitiesFolder}/${entityName}`);
		writeFile(`${this._entitiesFolder}/${entityName}/${entityName}.entity.ts`, content);
	}

	async run(options: CreateEntityOptions) {
		Loader.create('Creating entity', { doneMessage: 'Entity created!' });
		this.setEntitiesFolder();

		const pascalCaseName = formatName(options.name);

		if (options.contextName) {
			const pascalCaseContextName = formatName(options.contextName);
			const contextPath = this._ps.createContextFolder(
				this._entitiesFolder,
				pascalCaseContextName
			);

			this._entitiesFolder = contextPath;
		}

		await this.createFile(pascalCaseName, options.defaultProperties);
		Loader.stopAll();
	}
}
