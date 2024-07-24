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

	private async createPackageJson(options: CreateProjectOptions, projectPath: string): Promise<void> {
		const { name: projectName } = options;

		Loader.create('Creating npm project', { doneMessage: 'Npm project created' });

		return new Promise((resolve, reject) => {
			exec('npm init -y', { cwd: projectPath }, async (error) => {
				if (error) {
					Loader.interrupt();
					reject(error);
					return;
				}

				const packageJsonPath = `${projectPath}/package.json`;
				const packageJson = JSON.parse(readFile(packageJsonPath, 'utf-8'));
				packageJson.name = projectName;
				packageJson.main = 'src/index.js';
				packageJson.author = 'MAG CLI Tool';
				packageJson.description = 'Project created with the MAG CLI tool';
				packageJson.keywords = ARCHITECTURE_KEYWORDS[options.type];

				const executionPath = 'dist/index.js';
				packageJson.keywords.push('typescript');
				packageJson.scripts.build = 'tsc';
				packageJson.scripts.start = `npm run build && node ${executionPath}`;

				writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

				const indexContent = 'console.log("Hello World!");';
				createDirectory(`${projectPath}/src`);
				writeFile(`${projectPath}/src/index.ts`, indexContent);

				const gitignoreContent = await fetchUrl('https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore');
				writeFile(`${projectPath}/.gitignore`, gitignoreContent);

				resolve();
			});
		});
	}

	private async configureTypescript(projectPath: string): Promise<void> {
		Loader.create('Installing typescript', { doneMessage: 'Typescript installed' });

		return new Promise((resolve, reject) => {
			exec('npm install typescript --save-dev', { cwd: projectPath}, (error) => {
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
		this._ps.createFolderStructure(newFolderPath);
		Configuration.createDefaultConfigFile(options.type, newFolderPath);

		await this.createPackageJson(options, newFolderPath);
		await this.configureTypescript(newFolderPath);

		await Configuration.installMagDependencies(newFolderPath);
		Loader.stopAll();

		return newFolderPath;
	}

	deleteProject(){
		Loader.create(`Reversing project creation in path ${formatPath(this._projectPath)}`);
		deleteDirectory(this._projectPath);
		Loader.stopAll();
	}
}
