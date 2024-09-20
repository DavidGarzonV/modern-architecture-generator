import Loader from 'node-cli-loader';
import { ProjectStructure } from 'lib/shared/project-structure';
import { createDirectory, readFile, writeFile } from 'utils/file';
import { Configuration } from 'utils/singleton/configuration';
import { formatName, formatNameAttributes } from 'utils/string';

type CreateServiceOptions = {
	name: string;
	createTests?: boolean;
};

export class CreateService {
	private _servicesFolder: string = '';
	private _ps: ProjectStructure;

	constructor() {
		this._ps = new ProjectStructure();
	}

	private async createClass(name: string): Promise<void> {
		const projectPath = Configuration.getMagPath();
		const serviceTemplate = readFile(
			`${projectPath}/templates/services/index.txt`
		);

		const serviceName = await this._ps.askForCreateProjectFile(
			name,
			this._servicesFolder,
			'service'
		);
		createDirectory(this._servicesFolder);

		const content = serviceTemplate.replace(/ServiceName/g, serviceName);
		createDirectory(`${this._servicesFolder}`);
		writeFile(
			`${this._servicesFolder}/${serviceName}.service.ts`,
			content
		);
	}

	private createTestsFile(name: string): void {
		const projectPath = Configuration.getMagPath();
		const serviceTestTemplate = readFile(
			`${projectPath}/templates/services/test.txt`
		);

		let content = serviceTestTemplate.replace(/ServiceName/g, name);
		content = content.replace(/service/g, formatNameAttributes(name));

		try {
			writeFile(`${this._servicesFolder}/${name}.spec.ts`, content);
		} catch (error) {
			throw new Error('Could not create tests file');
		}
	}
	async run(options: CreateServiceOptions) {
		Loader.create('Creating service', { doneMessage: 'Service created!' });

		this._servicesFolder = this._ps.findFolderPathByName('services');

		const pascalCaseName = formatName(options.name);
		await this.createClass(pascalCaseName);

		if (options.createTests) {
			this.createTestsFile(pascalCaseName);
		}

		Loader.stopAll();
	}
}
