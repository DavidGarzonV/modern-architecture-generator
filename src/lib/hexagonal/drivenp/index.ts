import { ProjectStructure } from 'lib/shared/project-structure';
import { CreateDrivenPortOptions } from 'types/hexagonal/drivenp';
import { createFolder, pathExists, readFile, writeFile } from 'utils/file';
import { formatName } from 'utils/string';

export class CreateDrivenPort{
	private _drivenPortsFolder: string = '';
	private _ps: ProjectStructure;

	constructor(){
		this._ps = new ProjectStructure();
	}

	private getContent(name: string, entityPath?: string){
		const projectPath = process.cwd();
		let adapterTemplate = readFile(`${projectPath}/src/templates/ports/driven-port.txt`);
		
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

		return adapterTemplate.replace(/PortName/g, name);
	}

	private async createDrivenPort(options: CreateDrivenPortOptions): Promise<void> {
		const portName = await this._ps.askForCreateProjectFile(options.name, this._drivenPortsFolder, 'port');
		const content = this.getContent(portName, options.entity);

		createFolder(this._drivenPortsFolder);
		writeFile(`${this._drivenPortsFolder}/${portName}.port.ts`, content);
	}

	async run(options: CreateDrivenPortOptions): Promise<void> {
		console.info('Creating driven port...');
		
		this._drivenPortsFolder = this._ps.findFolderPathByName('driven-ports');
		if (!pathExists(this._drivenPortsFolder)) {
			throw new Error('Driven ports folder not found');
		}

		if (options.contextName) {
			const contextName = formatName(options.contextName);
			this._drivenPortsFolder += `/${contextName}`;
			createFolder(this._drivenPortsFolder);
		}

		await this.createDrivenPort(options);
		console.info('Driven port created!');
	}
}