import { ProjectStructure } from 'lib/shared/project-structure';
import { createDirectory, pathExists, readFile, writeFile } from 'utils/file';
import Loader from 'node-cli-loader';
import { Configuration } from 'utils/singleton/configuration';
import { formatName } from 'utils/string';

type CreateDrivenPortOptions = {
	name: string
	entity?: string
	contextName?: string
}

export class CreateDrivenPort{
	private _drivenPortsFolder: string = '';
	private _ps: ProjectStructure;

	constructor(){
		this._ps = new ProjectStructure();
	}

	private getContent(name: string, entityPath?: string){
		const projectPath = Configuration.getMagPath();
		let adapterTemplate = readFile(`${projectPath}/templates/ports/driven-port.txt`);

		if (entityPath) {
			const importPath = this._ps.getEntityImportPath(entityPath, this._drivenPortsFolder);
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

		return adapterTemplate.replace(/PortName/g, name);
	}

	private async createDrivenPort(options: CreateDrivenPortOptions): Promise<void> {
		const portName = await this._ps.askForCreateProjectFile(options.name, this._drivenPortsFolder, 'port');
		const content = this.getContent(portName, options.entity);

		createDirectory(this._drivenPortsFolder);
		writeFile(`${this._drivenPortsFolder}/${portName}.port.ts`, content);
	}

	async run(options: CreateDrivenPortOptions): Promise<void> {
		Loader.create(`Creating driven port ${options.name}`, { doneMessage: 'Driven port created!' });

		this._drivenPortsFolder = this._ps.findFolderPathByName('driven-ports');
		if (!pathExists(this._drivenPortsFolder)) {
			throw new Error('Driven ports folder not found');
		}

		if (options.contextName) {
			const contextName = formatName(options.contextName);
			this._drivenPortsFolder += `/${contextName}`;
			createDirectory(this._drivenPortsFolder);
		}

		await this.createDrivenPort(options);
		Loader.stopAll();
	}
}