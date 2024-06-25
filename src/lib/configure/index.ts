import Loader from 'node-cli-loader';
import { EnabledArchitectures } from 'constants/constants';
import { ProjectStructure } from 'lib/shared/project-structure';
import { createDirectory, pathExists } from 'utils/file';
import { CustomCommand } from 'utils/singleton/command';
import { Configuration } from 'utils/singleton/configuration';

type ConfigureProjectOptions = {
	type: EnabledArchitectures;
	createFolderStructure: boolean;
};

export class ConfigureProject{
	private _ps: ProjectStructure;

	constructor(){
		this._ps = new ProjectStructure();
	}

	private validateSrcFolder(){
		const executionPath = CustomCommand.getExecutionPath();
		const srcPath = `${executionPath}/src`;

		if (!pathExists(srcPath)) {
			console.info(`The directory ${srcPath} does not exist. Creating...`);

			try {
				createDirectory(srcPath);
			} catch (error) {
				throw new Error(`Error creating directory ${srcPath}`);
			}
		}
	}

	async run(options: ConfigureProjectOptions) {
		console.info('Configuring project...');

		this._ps.setProjectStructure(options.type);
		this.validateSrcFolder();

		const executionPath = CustomCommand.getExecutionPath();
		Configuration.createDefaultConfigFile(options.type, executionPath);

		if(options.createFolderStructure){
			Loader.create('Creating folder structure', { doneMessage: 'Folder structure created' });
			this._ps.createFolderStructure(executionPath);
			Loader.stopAll();
		}

		await Configuration.installMagDependencies(executionPath);

		Loader.stopAll();
	}
}