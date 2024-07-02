import Loader from 'node-cli-loader';
import { ProjectStructure } from 'lib/shared/project-structure';
import { createDirectory, writeFile } from 'utils/file';
import { formatName } from 'utils/string';
import { ClassProperty } from 'constants/types';
import { createJsClassContent, createJsInterfaceContent } from 'utils/jsfiles';

type CreateEntityOptions = {
	name: string
	contextName?: string
	useClass?: boolean
	defaultProperties?: ClassProperty[]
	settersAndGetters?: boolean
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

	private async createFile(
		name: string,
		useClass?: boolean,
		defaultProperties?: ClassProperty[],
		settersAndGetters?: boolean
	): Promise<void> {
		let content = '';
		const entityName = await this._ps.askForCreateProjectFile(name, this._entitiesFolder, 'entity');

		if (useClass) {
			content = createJsClassContent(entityName, defaultProperties, settersAndGetters);
		}else{
			content = createJsInterfaceContent(entityName, defaultProperties);
		}

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

		await this.createFile(pascalCaseName, options.useClass, options.defaultProperties, options.settersAndGetters);
		Loader.stopAll();
	}
}
