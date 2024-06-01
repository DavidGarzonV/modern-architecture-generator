import { ProjectStructure } from 'lib/shared/project-structure';
import { createDirectory, pathExists, readFile, writeFile } from 'utils/file';
import Loader from 'node-cli-loader';
import { Configuration } from 'utils/singleton/configuration';
import { formatName } from 'utils/string';

type CreateDrivingPortOptions = {
	name: string
	contextName?: string
}

export class CreateDrivingPort{
	private _drivingPortsFolder: string = '';
	private _ps: ProjectStructure;

	constructor(){
		this._ps = new ProjectStructure();
	}

	private getContent(name: string){
		const projectPath = Configuration.getMagPath();
		const adapterTemplate = readFile(`${projectPath}/templates/ports/driving-port.txt`);
		return adapterTemplate.replace(/PortName/g, name);
	}

	private async createDrivingPort(options: CreateDrivingPortOptions): Promise<void> {
		const portName = await this._ps.askForCreateProjectFile(options.name, this._drivingPortsFolder, 'port');
		const content = this.getContent(portName);

		createDirectory(this._drivingPortsFolder);
		writeFile(`${this._drivingPortsFolder}/${portName}.port.ts`, content);
	}

	async run(options: CreateDrivingPortOptions): Promise<void> {
		Loader.create(`Creating driving port ${options.name}`, { doneMessage: 'Driving port created!' });

		this._drivingPortsFolder = this._ps.findFolderPathByName('driving-ports');
		if (!pathExists(this._drivingPortsFolder)) {
			throw new Error('Driving ports folder not found');
		}

		if (options.contextName) {
			const contextName = formatName(options.contextName);
			this._drivingPortsFolder += `/${contextName}`;
			createDirectory(this._drivingPortsFolder);
		}

		await this.createDrivingPort(options);
		Loader.stopAll();
	}
}