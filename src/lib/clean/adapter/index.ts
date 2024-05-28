import path from 'path';
import { ProjectStructure } from 'lib/shared/project-structure';
import { createDirectory, findFileFilePath, pathExists, readFile, writeFile } from 'utils/file';
import { formatName } from 'utils/string';
import { readTypescriptFile } from 'utils/typescript';
import { Configuration } from 'utils/singleton/configuration';

type CreateAdapterOptions = {
	name: string
	iadapter: string
	entity?: string
	contextName?: string
}

export default class CreateAdapter {
	private _adaptersFolder: string = '';
	private _ps: ProjectStructure;

	constructor(){
		this._ps = new ProjectStructure();
	}

	private getImportPath(origin: string, destination: string): string {
		const finalPath = path.relative(origin, destination).replace(/\\/g, '/');
		return finalPath;
	}

	// TODO - Implement interface methods
	private async getContent(name: string, iadapter: string): Promise<string> {
		const interfaceAdapterName = formatName(iadapter);

		const projectPath = Configuration.getMagPath();
		let adapterMethodsTemplate = readFile(`${projectPath}/src/templates/adapters/adapter.txt`);

		const repositoryName = `${interfaceAdapterName}.repository.ts`;
		const interfaceAdaptersFolder = this._ps.findFolderPathByName('interface-adapters');

		const repositoryPath = findFileFilePath(repositoryName, interfaceAdaptersFolder);

		if (!repositoryPath) {
			throw new Error('Invalid interface adapter');
		}

		const repositoryFile = await readTypescriptFile(
			repositoryPath
		);

		if (repositoryFile && repositoryFile.interfaces.length > 0) {
			const [interfaceName] = repositoryFile.interfaces;
			const repositoryImportPath = this.getImportPath(this._adaptersFolder, repositoryPath);

			adapterMethodsTemplate = adapterMethodsTemplate.replace(/IAdapterRoute/g, repositoryImportPath.replace('.ts', ''));
			adapterMethodsTemplate = adapterMethodsTemplate.replace(/IAdapter/g, interfaceName.name);
		}else{
			throw new Error('Invalid interface adapter');
		}

		return adapterMethodsTemplate.replace(/Adapter/g, name);
	}

	private async createAdapter(options: CreateAdapterOptions): Promise<void> {
		const adapterName = await this._ps.askForCreateProjectFile(options.name, this._adaptersFolder, 'adapter');
		const content = await this.getContent(adapterName, options.iadapter);
		createDirectory(this._adaptersFolder);
		writeFile(`${this._adaptersFolder}/${adapterName}.adapter.ts`, content);
	}

	async run(options: CreateAdapterOptions): Promise<void> {
		console.info(`Creating adapter ${options.name}...`);

		this._adaptersFolder = this._ps.findFolderPathByName('adapters');
		if (!pathExists(this._adaptersFolder)) {
			throw new Error('Adapters folder not found');
		}

		if (options.contextName) {
			const contextName = formatName(options.contextName);
			this._adaptersFolder += `/${contextName}`;
			createDirectory(this._adaptersFolder);
		}

		await this.createAdapter(options);
		console.info('Adapter created!');
	}
}
