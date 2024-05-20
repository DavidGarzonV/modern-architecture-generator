import { ProjectStructure } from 'lib/shared/project-structure';
import { CreateDrivingPortOptions } from 'types/hexagonal/drivingp';
import { createFolder, pathExists, readFile, writeFile } from 'utils/file';
import { formatName } from 'utils/string';

export class CreateDrivingPort{
	private _drivingPortsFolder: string = '';
	private _ps: ProjectStructure;

	constructor(){
		this._ps = new ProjectStructure();
	}

	private getContent(name: string){
		const projectPath = process.cwd();
		const adapterTemplate = readFile(`${projectPath}/src/templates/ports/driving-port.txt`);
		return adapterTemplate.replace(/PortName/g, name);
	}

	private async createDrivingPort(options: CreateDrivingPortOptions): Promise<void> {
		const portName = await this._ps.askForCreateProjectFile(options.name, this._drivingPortsFolder, 'port');
		const content = this.getContent(portName);

		createFolder(this._drivingPortsFolder);
		writeFile(`${this._drivingPortsFolder}/${portName}.port.ts`, content);
	}

	async run(options: CreateDrivingPortOptions): Promise<void> {
		console.info('Creating driving port...');
		
		this._drivingPortsFolder = this._ps.findFolderPathByName('driving-ports');
		if (!pathExists(this._drivingPortsFolder)) {
			throw new Error('Driving ports folder not found');
		}

		if (options.contextName) {
			const contextName = formatName(options.contextName);
			this._drivingPortsFolder += `/${contextName}`;
			createFolder(this._drivingPortsFolder);
		}

		await this.createDrivingPort(options);
		console.info('Driving port created!');
	}
}