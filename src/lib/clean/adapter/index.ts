import prompts from 'prompts';
import path from 'path';
import { ProjectStructure } from 'lib/shared/project-structure';
import { CreateAdapterOptions } from 'types/clean/adapter';
import { createFolder, pathExists, readFile, writeFile } from 'utils/file';
import { formatName } from 'utils/string';
import { readTypescriptFile } from 'utils/typescript';

export default class CreateAdapter extends ProjectStructure {
	private _adaptersFolder: string = '';

	private getImportPath(origin: string, destination: string): string {
		const finalPath = path.relative(origin, destination).replace(/\\/g, '/');
		return finalPath;
	}

	// TODO - Implement interface methods
	private async getContent(name: string, iadapter: string): Promise<string> {
		const interfaceAdapterName = formatName(iadapter);

		const projectPath = process.cwd();
		let adapterMethodsTemplate = readFile(`${projectPath}/src/templates/adapters/adapter.txt`);

		const repositoryName = `${interfaceAdapterName}.repository.ts`;
		const interfaceAdaptersFolder = this.findFolderPathByName('interface-adapters');
		const repositoryFile = await readTypescriptFile(
			`${interfaceAdaptersFolder}/${repositoryName}`
		);

		if (repositoryFile && repositoryFile.interfaces.length > 0) {
			const [interfaceName] = repositoryFile.interfaces;
			const repositoryImportPath = this.getImportPath(this._adaptersFolder, `${interfaceAdaptersFolder}/${repositoryName}`);

			adapterMethodsTemplate = adapterMethodsTemplate.replace(/IAdapterRoute/g, repositoryImportPath);
			adapterMethodsTemplate = adapterMethodsTemplate.replace(/IAdapter/g, interfaceName.name);
		}else{
			throw new Error('Invalid interface adapter');
		}

		return adapterMethodsTemplate.replace(/Adapter/g, name);
	}

	private async createAdapter(options: CreateAdapterOptions): Promise<void> {
		const name = formatName(options.name);

		let adapterName = name;

		if (pathExists(`${this._adaptersFolder}/${name}.repository.ts`)) {
			const { overwrite, newName } = await prompts([
				{
					type: 'confirm',
					name: 'overwrite',
					message: `The adapter ${name} already exists. Do you want to overwrite it?`,
					initial: false,
				},
				{
					type: (prev) => (!prev ? 'text' : null),
					name: 'newName',
					message: 'Enter a new name for the adapter:',
				},
			]);

			if (!overwrite) {
				adapterName = formatName(newName);
			}
		}

		const content = await this.getContent(
			adapterName,
			options.iadapter
		);
		createFolder(this._adaptersFolder);
		writeFile(`${this._adaptersFolder}/${adapterName}.adapter.ts`, content);
	}

	async run(options: CreateAdapterOptions): Promise<void> {
		console.info(`Creating adapter ${options.name}...`);

		this._adaptersFolder = this.findFolderPathByName('adapters');
		if (!pathExists(this._adaptersFolder)) {
			throw new Error('Adapters folder not found');
		}

		if (options.contextName) {
			const contextName = formatName(options.contextName);
			this._adaptersFolder += `/${contextName}`;
			createFolder(this._adaptersFolder);
		}

		await this.createAdapter(options);
		console.info('Adapter created!');
	}
}
