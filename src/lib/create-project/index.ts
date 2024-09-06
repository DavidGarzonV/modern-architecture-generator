import { pathExists, readFile, validatePath, writeFile } from './../../utils/file';
import { exec } from 'child_process';
import prompts from 'prompts';
import {
	ARCHITECTURE_KEYWORDS,
	EnabledArchitectures,
	README_PATH,
	README_PUBLIC_PATH,
} from 'constants/constants';
import { ProjectStructure } from 'lib/shared/project-structure';
import { copyFile, createDirectory, deleteDirectory, readDirectory } from 'utils/file';
import { CustomCommand } from 'utils/singleton/command';
import { Configuration } from 'utils/singleton/configuration';
import Loader from 'node-cli-loader';
import { formatPath } from 'utils/string';
import { fetchUrl } from 'utils/fetch';
import { readTypescriptConfigFile, updateTypescriptConfig } from 'utils/typescript';

type CreateProjectOptions = {
	name: string;
	type: EnabledArchitectures;
	testingFramework?: string;
};

type PackageJsonConfiguration = {
	name?: string;
	main?: string;
	author?: string;
	description?: string;
	keywords?: string[];
	scripts?: Record<string, string>;
}

export default class CreateProject {
	private _ps: ProjectStructure;
	private _projectPath: string = '';
	private _type: EnabledArchitectures = EnabledArchitectures.Clean;

	constructor(){
		this._ps = new ProjectStructure();
	}

	private validateExecutionPath(executionPath: string){
		validatePath(executionPath);

		const files = readDirectory(executionPath);
		const projectFilesExtensions = ['ts', 'js', 'json', 'yaml', 'yml'];

		if(files.length > 0){
			const existsProjectConfigurationFile = files.some(
				(file) => file === 'package.json' || projectFilesExtensions.includes(file.split('.').pop()!)
			);

			if (existsProjectConfigurationFile) {
				console.error(`The directory ${formatPath(executionPath)} has an existent project. Please select another directory.`);
				process.exit(0);
			}
		}
	}

	private async createProjectDirectory(projectPath: string): Promise<void> {
		if (pathExists(projectPath)) {
			Loader.stopAll();
			console.info('The directory already exists');

			const response = await prompts([
				{
					type: 'confirm',
					name: 'overwrite',
					message: 'Do you want to overwrite the directory?',
				},
			]);

			if (response.overwrite === false) {
				process.exit(0);
			}

			Loader.create('Creating folder', { doneMessage: 'Folder created' });
			deleteDirectory(projectPath);
		}else{
			Loader.create('Creating folder', { doneMessage: 'Folder created' });
		}

		try {
			createDirectory(projectPath);
		} catch (error) {
			throw new Error('Could not create directory');
		}
	}

	private createDocumentation(): void {
		try {
			const magPath = Configuration.getMagPath();
			copyFile(
				`${magPath}/${README_PATH}/${this._type}.md`,
				`${this._projectPath}/README.md`
			);

			copyFile(
				`${magPath}/${README_PATH}/${this._type}.md`,
				`${this._projectPath}/README.md`
			);

			createDirectory(`${this._projectPath}/public`);
			createDirectory(`${this._projectPath}/public/${this._type}`);

			const resourcesPath = `${magPath}/${README_PUBLIC_PATH}/${this._type}`;
			const files = readDirectory(resourcesPath);

			files.forEach((file) => {
				copyFile(
					`${resourcesPath}/${file}`,
					`${this._projectPath}/public/${this._type}/${file}`
				);
			});
		} catch (error) {
			throw new Error('Could not create documentation');
		}
	}

	private updatePackageJson(configurationToUpdate: PackageJsonConfiguration): void {
		const packageJsonPath = `${this._projectPath}/package.json`;
		const packageJson = JSON.parse(readFile(packageJsonPath, 'utf-8'));

		const newConfiguration = {...configurationToUpdate};
		if (newConfiguration.scripts) {
			newConfiguration.scripts = {
				...packageJson.scripts,
				...newConfiguration.scripts,
			};
		}

		writeFile(packageJsonPath, JSON.stringify({
			...packageJson,
			...newConfiguration,
		}, null, 2));
	}

	private async createPackageJson(options: CreateProjectOptions): Promise<void> {
		const { name: projectName } = options;

		Loader.create('Creating npm project', { doneMessage: 'Npm project created' });

		return new Promise((resolve, reject) => {
			exec('npm init -y', { cwd: this._projectPath }, async (error) => {
				if (error) {
					Loader.interrupt();
					reject(error);
					return;
				}

				const executionPath = 'dist/index.js';

				this.updatePackageJson({
					name: projectName,
					main: 'dist/index.js',
					author: 'MAG CLI Tool',
					description: 'Project created with the MAG CLI tool',
					keywords: ARCHITECTURE_KEYWORDS[options.type],
					scripts: {
						build: 'tsc',
						start: `npm run build && node ${executionPath}`,
					}
				});

				const indexContent = 'console.log("Hello World!");';
				createDirectory(`${this._projectPath}/src`);
				writeFile(`${this._projectPath}/src/index.ts`, indexContent);

				const gitignoreContent = await fetchUrl('https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore');
				writeFile(`${this._projectPath}/.gitignore`, gitignoreContent);

				resolve();
			});
		});
	}

	private setPathAlias(): void {
		const currentConfig = readTypescriptConfigFile();
		if (currentConfig) {
			currentConfig.compilerOptions.paths = this._ps.getProjectPaths();
			updateTypescriptConfig(currentConfig);
		}else{
			throw new Error('Could not read typescript config');
		}
	}

	private setIncludePaths(): void {
		const currentConfig = readTypescriptConfigFile();
		if (currentConfig) {
			currentConfig.include = ['src/**/*', 'tests/**/*'];
			updateTypescriptConfig(currentConfig);
		}else{
			throw new Error('Could not read typescript config');
		}
	}

	private async configureTypescript(): Promise<void> {
		Loader.create('Installing typescript', { doneMessage: 'Typescript installed' });

		return new Promise((resolve, reject) => {
			exec('npm install --save-dev typescript @types/node', { cwd: this._projectPath}, (error) => {
				if (error) {
					Loader.interrupt();
					reject(error);
					return;
				}

				Loader.create('Configuring typescript', { doneMessage: 'Typescript configured' });

				const filesEol = Configuration.get('filesEOL');
				const tscCommand = `npm run build -- --init --baseUrl "./src" --rootDir "./src" --outDir "./dist" --target esnext --module nodenext  --esModuleInterop --newLine ${filesEol}`;
				exec(tscCommand, { cwd: this._projectPath }, (error) => {
					if (error) {
						reject(error);
						return;
					}

					this.setPathAlias();
					this.setIncludePaths();

					resolve();
				});
			});
		});
	}

	private addRequiredDependencies(): Promise<void> {
		Loader.create('Installing required dependencies', { doneMessage: 'Dependencies installed' });
		const dependenciesToInstall = ['tsc-alias'];

		return new Promise((resolve, reject) => {
			exec(`npm install --save-dev ${dependenciesToInstall.join(' ')}`, { cwd: this._projectPath}, (error) => {
				if (error) {
					Loader.interrupt();
					reject(error);
					return;
				}

				this.updatePackageJson({
					scripts: {
						build: 'tsc & tsc-alias'
					}
				});

				resolve();
			});
		});
	}

	async run(options: CreateProjectOptions): Promise<string> {
		console.info('Creating project...');
		this._type = options.type;
		this._ps.setProjectStructure(options.type);
		const executionPath = CustomCommand.getExecutionPath();

		this.validateExecutionPath(executionPath);

		const newFolderPath = `${executionPath}/${options.name}`;
		await this.createProjectDirectory(newFolderPath);
		this._projectPath = newFolderPath;
		CustomCommand.setExecutionPath(this._projectPath);

		Loader.create('Creating project structure', { doneMessage: 'Project structure created' });
		this.createDocumentation();
		this._ps.createFolderStructure(this._projectPath);
		Configuration.createDefaultConfigFile(options.type, this._projectPath);

		await this.createPackageJson(options);
		await this.configureTypescript();
		await this.addRequiredDependencies();


		if (options.testingFramework) {
			await Configuration.configureTestingFramework(options.testingFramework, executionPath);
		}

		await Configuration.installMagDependencies(this._projectPath);
		Loader.stopAll();

		return this._projectPath;
	}

	deleteProject(){
		Loader.create(`Reversing project creation in path ${formatPath(this._projectPath)}`);
		deleteDirectory(this._projectPath);
		Loader.stopAll();
	}
}
