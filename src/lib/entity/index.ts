import { ProjectStructure } from 'lib/shared/project-structure';
import prompts from 'prompts';
import { CreateEntityOptions, Property } from 'types/entity';
import { createFolder, pathExists, writeFile } from 'utils/file';
import { formatName } from 'utils/string';

export default class CreateEntity extends ProjectStructure {
	private entitiesFolder: string = '';

	constructor() {
		super();
	}

	private setEntitiesFolder(): void {
		const defaultEntitiesFolder = this.findFolderPathByName('entities');
		this.entitiesFolder = defaultEntitiesFolder;
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

	private async createFile(
		name: string,
		path: string,
		defaultProperties?: Property[]
	): Promise<void> {
		try {
			let entityName = name;
			let content = '';

			if (pathExists(`${path}/${entityName}/${entityName}.entity.ts`)) {
				const { overwrite, newName } = await prompts([
					{
						type: 'confirm',
						name: 'overwrite',
						message: `The entity ${name} already exists. Do you want to overwrite it?`,
						initial: false,
					},
					{
						type: (prev) => (!prev ? 'text' : null),
						name: 'newName',
						message: 'Enter a new name for the entity:',
					},
				]);

				if (!overwrite) {
					entityName = formatName(newName);
				}
			}

			content = this.getFileContent(entityName, defaultProperties);

			createFolder(`${path}/${entityName}`);
			writeFile(`${path}/${entityName}/${entityName}.entity.ts`, content);
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
			const contextPath = this.createContextFolder(
				this.entitiesFolder,
				pascalCaseContextName
			);

			if (pathExists(this.entitiesFolder)) {
				createFolder(pascalCaseContextName);
			}

			this.entitiesFolder = contextPath;
		}

		const entitiesPath = `${this.entitiesFolder}`;
		createFolder(entitiesPath);

		await this.createFile(pascalCaseName, entitiesPath, options.defaultProperties);
		console.info('Entity created!');
	}
}
