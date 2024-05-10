import { ProjectStructure } from 'lib/shared/project-structure';
import { CreateIAdapterOptions } from 'types/clean/iadapter';
import { createFolder, pathExists, readFile, writeFile } from 'utils/file';
import { formatName } from 'utils/string';

export default class CreateIAdapter extends ProjectStructure{
	private _interfaceAdaptersFolder: string = '';

	private getContent(name: string, entityPath?: string){
		const projectPath = process.cwd();
		let adapterTemplate = readFile(`${projectPath}/src/templates/adapters/iadapter.txt`);

		const entitiesFolder = this.findFolderPathByName('entities');
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
		const adapterName = await this.askForCreateProjectFile(options.name, this._interfaceAdaptersFolder, 'repository');
		const content = this.getContent(adapterName, options.entity);
		createFolder(this._interfaceAdaptersFolder);
		writeFile(`${this._interfaceAdaptersFolder}/${adapterName}.repository.ts`, content);
	}

	async run(options: CreateIAdapterOptions): Promise<void>{
		console.info(`Creating interface adapter ${options.name}...`);

		this._interfaceAdaptersFolder = this.findFolderPathByName('interface-adapters');
		if (!pathExists(this._interfaceAdaptersFolder)) {
			throw new Error('Interface adapters folder not found');
		}

		if (options.contextName) {
			const contextName = formatName(options.contextName);
			this._interfaceAdaptersFolder += `/${contextName}`;
			createFolder(this._interfaceAdaptersFolder);
		}

		await this.createAdapter(options);
		console.info('Interface adapter created!');
	}
}