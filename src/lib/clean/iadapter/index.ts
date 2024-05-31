import { ProjectStructure } from 'lib/shared/project-structure';
import { createDirectory, pathExists, readFile, writeFile } from 'utils/file';
import Loader from 'node-cli-loader';
import { Configuration } from 'utils/singleton/configuration';
import { formatName } from 'utils/string';

type CreateIAdapterOptions = {
	name: string
	entity?: string
	contextName?: string
}

export default class CreateIAdapter{
	private _interfaceAdaptersFolder: string = '';
	private _ps: ProjectStructure;

	constructor(){
		this._ps = new ProjectStructure();
	}

	private getContent(name: string, entityPath?: string){
		const projectPath = Configuration.getMagPath();
		let adapterTemplate = readFile(`${projectPath}/src/templates/adapters/iadapter.txt`);

		if (entityPath) {
			const importPath = this._ps.getEntityImportPath(entityPath, this._interfaceAdaptersFolder);
			if (importPath && entityPath) {
				adapterTemplate = `import { IEntity } from '${importPath}';\n${adapterTemplate}`;
				const entityName = entityPath.split('/').pop()?.split('\\').pop();
				adapterTemplate = adapterTemplate.replace(/IEntity/g, entityName!);
			}else{
				console.info(`Entity ${entityPath} not found, ignoring...`);
			}
		}else{
			adapterTemplate = adapterTemplate.replace(/IEntity/g, 'object');
		}
	
		return adapterTemplate.replace(/IAdapter/g, name);
	}

	private async createAdapter(options: CreateIAdapterOptions): Promise<void> {
		const adapterName = await this._ps.askForCreateProjectFile(options.name, this._interfaceAdaptersFolder, 'repository');
		const content = this.getContent(adapterName, options.entity);
		createDirectory(this._interfaceAdaptersFolder);
		writeFile(`${this._interfaceAdaptersFolder}/${adapterName}.repository.ts`, content);
	}

	async run(options: CreateIAdapterOptions): Promise<void>{
		Loader.create(`Creating interface adapter ${options.name}`, { doneMessage: 'Interface adapter created!' });

		this._interfaceAdaptersFolder = this._ps.findFolderPathByName('interface-adapters');
		if (!pathExists(this._interfaceAdaptersFolder)) {
			throw new Error('Interface adapters folder not found');
		}

		if (options.contextName) {
			const contextName = formatName(options.contextName);
			this._interfaceAdaptersFolder += `/${contextName}`;
			createDirectory(this._interfaceAdaptersFolder);
		}

		await this.createAdapter(options);
		Loader.stopAll();
	}
}