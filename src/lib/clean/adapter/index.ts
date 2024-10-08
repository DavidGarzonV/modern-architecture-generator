import { ProjectStructure } from 'lib/shared/project-structure';
import { createDirectory, findFileFilePath, pathExists, readFile, writeFile } from 'utils/file';
import { formatName } from 'utils/string';
import { readTypescriptFile } from 'utils/typescript';
import { Configuration } from 'utils/singleton/configuration';
import Loader from 'node-cli-loader';

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

	// TODO - Implement interface methods
	private async getContent(name: string, iadapter: string): Promise<string> {
		const iadapterName = iadapter.split('/');
		let nameWithoutPath = '';
		let icontext: string | undefined = undefined;
		if (iadapterName.length > 1) {
			nameWithoutPath = iadapterName[iadapterName.length - 1];
			icontext = iadapterName[0];
		}else{
			nameWithoutPath = iadapterName[0];
		}

		const interfaceAdapterName = formatName(nameWithoutPath);

		const projectPath = Configuration.getMagPath();
		let adapterMethodsTemplate = readFile(`${projectPath}/templates/adapters/adapter.txt`);

		const repositoryName = `${interfaceAdapterName}.repository.ts`;
		const interfaceAdaptersFolder = this._ps.findFolderPathByName('interface-adapters');

		const repositoryPath = findFileFilePath(interfaceAdaptersFolder, repositoryName);

		if (!repositoryPath) {
			throw new Error('Invalid interface adapter');
		}

		const repositoryFile = await readTypescriptFile(
			repositoryPath
		);

		if (repositoryFile && repositoryFile.interfaces.length > 0) {
			const [interfaceName] = repositoryFile.interfaces;
			let repositoryImportPath = `@interface-adapters/${interfaceAdapterName}.repository`;
			if (icontext) {
				repositoryImportPath = `@interface-adapters/${icontext}/${interfaceAdapterName}.repository`;
			}

			adapterMethodsTemplate = adapterMethodsTemplate.replace(/IAdapterRoute/g, repositoryImportPath.replace('.ts', ''));
			adapterMethodsTemplate = adapterMethodsTemplate.replace(/IAdapter/g, interfaceName.name);
		}else{
			throw new Error('Invalid interface adapter');
		}

		return adapterMethodsTemplate.replace(/Adapter/g, `${name}Adapter`);
	}

	private async createAdapter(options: CreateAdapterOptions): Promise<void> {
		const adapterName = await this._ps.askForCreateProjectFile(options.name, this._adaptersFolder, 'adapter');
		const content = await this.getContent(adapterName, options.iadapter);
		createDirectory(this._adaptersFolder);
		writeFile(`${this._adaptersFolder}/${adapterName}.adapter.ts`, content);
	}

	async run(options: CreateAdapterOptions): Promise<void> {
		Loader.create(`Creating adapter ${options.name}`, { doneMessage: 'Adapter created!' });

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
		Loader.stopAll();
	}
}
