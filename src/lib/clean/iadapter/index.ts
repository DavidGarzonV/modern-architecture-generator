import { ProjectStructure } from 'lib/shared/project-structure';
import { createDirectory, pathExists, readFile, writeFile } from 'utils/file';
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

		const entitiesFolder = this._ps.findFolderPathByName('entities');
		const finalEntityPath = `${entitiesFolder}/${entityPath}/${entityPath}.entity.ts`;

		if (entityPath) {
			if (pathExists(finalEntityPath)) {
				const entityName = entityPath.split('/').pop()?.split('\\').pop();
				adapterTemplate = adapterTemplate.replace(/IEntity/g, entityName!);
			}else{
				console.info(`Entity ${finalEntityPath} not found, ignoring...`);
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
		console.info(`Creating interface adapter ${options.name}...`);

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
		console.info('Interface adapter created!');
	}
}