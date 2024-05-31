import { pathExists, readFile, validatePath, writeFile } from './../../utils/file';
import { exec } from 'child_process';
import prompts from 'prompts';
import {
	ARCHITECTURE_KEYWORDS,
	EnabledArchitectures,
	README_PATH,
	README_PUBLIC_PATH,
} from 'constants/constants';
import { FolderItem, MagConfiguration } from 'constants/types';
import { ProjectStructure } from 'lib/shared/project-structure';
import { copyFile, createDirectory, deleteDirectory, readDirectory } from 'utils/file';
import { CustomCommand } from 'utils/singleton/command';
import { Configuration } from 'utils/singleton/configuration';
import Loader from 'node-cli-loader';
import { formatPath } from 'utils/string';

type CreateProjectOptions = {
	name: string;
	type: EnabledArchitectures;
};

export default class CreateProject {
	private _ps: ProjectStructure;
	private _projectPath: string = '';

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

	private createDocumentation(type: EnabledArchitectures, newFolderPath: string): void {
		try {
			const projectPath = Configuration.getMagPath();
			copyFile(
				`${projectPath}/${README_PATH}/${type}.md`,
				`${newFolderPath}/README.md`
			);

			copyFile(
				`${projectPath}/${README_PATH}/${type}.md`,
				`${newFolderPath}/README.md`
			);

			createDirectory(`${newFolderPath}/public`);
			createDirectory(`${newFolderPath}/public/${type}`);

			const resourcesPath = `${projectPath}/${README_PUBLIC_PATH}/${type}`;
			const files = readDirectory(resourcesPath);

			files.forEach((file) => {
				copyFile(
					`${resourcesPath}/${file}`,
					`${newFolderPath}/public/${type}/${file}`
				);
			});
		} catch (error) {
			throw new Error('Could not create documentation');
		}
	}

	private createParentFolder(item: FolderItem, srcPath: string): string {
		if (item.parent) {
			const findParent = this._ps.projectStructure.find((folder) => folder.name === item.parent);
			const parentPath = this.createParentFolder(findParent!, srcPath);
			return createDirectory(`${parentPath}/${item.name}`);
		}else{
			return createDirectory(`${srcPath}/${item.name}`);
		}
	}

	private createFolderStructure(newFolderPath: string): void {
		const srcPath = `${newFolderPath}/src`;
		createDirectory(srcPath);

		for (const item of this._ps.projectStructure) {
			this.createParentFolder(item, srcPath);
		}
	}

	private async createPackageJson(options: CreateProjectOptions, projectPath: string): Promise<void> {
		const { name: projectName } = options;

		Loader.create('Creating npm project', { doneMessage: 'Npm project created' });

		return new Promise((resolve, reject) => {
			exec('npm init -y', { cwd: projectPath }, (error) => {
				if (error) {
					Loader.interrupt();
					reject(error);
					return;
				}

				const packageJsonPath = `${projectPath}/package.json`;
				const packageJson = JSON.parse(readFile(packageJsonPath, 'utf-8'));
				packageJson.name = projectName;
				packageJson.main = 'index.js';
				packageJson.author = 'MAG CLI Tool';
				packageJson.description = 'Project created with the MAG CLI tool';
				packageJson.keywords = ARCHITECTURE_KEYWORDS[options.type];

				const executionPath = 'dist/index.js';
				packageJson.keywords.push('typescript');
				packageJson.scripts.build = 'tsc';
				packageJson.scripts.start = `npm run build && node ${executionPath}`;

				writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

				const indexContent = 'console.log("Hello World!");';
				writeFile(`${projectPath}/src/index.ts`, indexContent);

				resolve();
			});
		});
	}

	private async configureTypescript(projectPath: string): Promise<void> {
		Loader.create('Installing typescript', { doneMessage: 'Typescript installed' });

		return new Promise((resolve, reject) => {
			exec('npm install typescript -g ', { cwd: projectPath}, (error) => {
				if (error) {
					Loader.interrupt();
					reject(error);
					return;
				}

				Loader.create('Configuring typescript', { doneMessage: 'Typescript configured' });
				exec('tsc --init --baseUrl "./src" --rootDir "./src" --outDir "./dist"', { cwd: projectPath }, (error) => {
					if (error) {
						reject(error);
						return;
					}

					resolve();
				});
			});
		});
	}

	private createDefaultConfigFile(type: EnabledArchitectures, projectPath: string): void {
		try {
			const config: MagConfiguration = {
				architecture: type,
			};
			writeFile(`${projectPath}/${Configuration.configurationFile}`, JSON.stringify(config, null, 2));
		} catch (error) {
			throw new Error('Could not create config file');
		}
	}

	private async installMagDependencies(projectPath: string): Promise<void> {
		if (process.env.INSTALL_MAG_DEPENDENCIES === 'false') {
			return Promise.resolve();
		}

		Loader.create('Installing mag dependencies', { doneMessage: 'Mag dependencies installed' });

		return new Promise((resolve, reject) => {
			exec('npm install modern-architecture-generator --save-dev', { cwd: projectPath }, (error) => {
				if (error) {
					Loader.interrupt();
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	async run(options: CreateProjectOptions): Promise<string> {
		console.info('Creating project...');
		this._ps.setProjectStructure(options.type);
		const executionPath = CustomCommand.getExecutionPath();

		this.validateExecutionPath(executionPath);

		const newFolderPath = `${executionPath}/${options.name}`;
		await this.createProjectDirectory(newFolderPath);
		this._projectPath = newFolderPath;

		Loader.create('Creating project structure', { doneMessage: 'Project structure created' });
		this.createDocumentation(options.type, newFolderPath);
		this.createFolderStructure(newFolderPath);
		this.createDefaultConfigFile(options.type, newFolderPath);

		await this.createPackageJson(options, newFolderPath);
		await this.configureTypescript(newFolderPath);

		await this.installMagDependencies(newFolderPath);
		Loader.stopAll();

		return newFolderPath;
	}

	deleteProject(){
		Loader.create(`Reversing project creation in path ${formatPath(this._projectPath)}`);
		deleteDirectory(this._projectPath);
		Loader.stopAll();
	}
}
