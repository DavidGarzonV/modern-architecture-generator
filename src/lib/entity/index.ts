import { ProjectStructure } from 'lib/shared/project-structure';
import { CreateEntityOptions } from 'types/entity';
import { createFolder, pathExists, readFile, writeFile } from 'utils/file';
import { formatName } from 'utils/string';

export default class CreateEntity extends ProjectStructure {
	private entitiesFolder: string = '';
	
	constructor(){
		super();
	}

	private setEntitiesFolder(): void {
		const defaultUseCasesFolder = this.findFolderPathByName('entities');
		this.entitiesFolder = defaultUseCasesFolder;

		if (!this.entitiesFolder) {
			throw new Error('Could not find entities folder');
		}

		createFolder(this.entitiesFolder);
	}

	private async createFile(name: string, useClass: boolean, path: string): Promise<void> {
		const projectPath = process.cwd();
		const templateName = !useClass ? 'interface.ts' : 'class.ts';
		const useCaseTemplate = readFile(`${projectPath}/src/templates/entities/${templateName}`);
		const content = useCaseTemplate.replace(/EntityName/g, name);

		try {
			writeFile(`${path}/${name}.entity.ts`, content);
		} catch (error) {
			throw new Error('Could not create entity file');
		}
	}

	async run(options: CreateEntityOptions) {
		console.info('Creating entity...');
		this.setEntitiesFolder();

		const pascalCaseName = formatName(options.name);

		if (options.useContext && options.contextName) {
			const pascalCaseContextName = formatName(options.contextName);
			const contextPath = this.createContextFolder(this.entitiesFolder, pascalCaseContextName);

			if (pathExists(this.entitiesFolder)) {
				createFolder(pascalCaseContextName);
			}

			this.entitiesFolder = contextPath;
		}

		const entitiesPath = `${this.entitiesFolder}/${pascalCaseName}`;
		createFolder(entitiesPath);

		this.createFile(pascalCaseName, !!options.useClass, entitiesPath);
		console.info('Entity created!');
	}
}