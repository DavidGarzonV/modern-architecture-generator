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
import { copyFile, createFolder, deleteFolder, readDirectory } from 'utils/file';

type CreateProjectArguments = {
	path?: string;
};

type CreateProjectOptions = CreateProjectArguments & {
	name: string;
	type: EnabledArchitectures;
};

export default class CreateProject {
	private _ps: ProjectStructure;

	constructor(){
		this._ps = new ProjectStructure();
	}

	private async createDirectory(path: string): Promise<void> {
		if (pathExists(path)) {
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

			deleteFolder(path);
		}

		try {
			createFolder(path);
		} catch (error) {
			throw new Error('Could not create directory');
		}
	}

	private createDocumentation(type: EnabledArchitectures, newFolderPath: string): void {
		try {
			const projectPath = process.cwd();
			copyFile(
				`${projectPath}/${README_PATH}/${type}.md`,
				`${newFolderPath}/README.md`
			);

			createFolder(`${newFolderPath}/public`);

			const resourcesPath = `${projectPath}/${README_PUBLIC_PATH}/${type}`;
			const files = readDirectory(resourcesPath);

			files.forEach((file) => {
				copyFile(
					`${resourcesPath}/${file}`,
					`${newFolderPath}/public/${file}`
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
			return createFolder(`${parentPath}/${item.name}`);
		}else{
			return createFolder(`${srcPath}/${item.name}`);
		}
	}

	private createFolderStructure(newFolderPath: string): void {
		const srcPath = `${newFolderPath}/src`;
		createFolder(srcPath);

		for (const item of this._ps.projectStructure) {
			this.createParentFolder(item, srcPath);
		}
	}

	private async createPackageJson(options: CreateProjectOptions, projectPath: string): Promise<void> {
		const { name: projectName } = options;

		console.info('Creating npm project...');

		return new Promise((resolve, reject) => {
			exec('npm init -y', { cwd: projectPath }, (error) => {
				if (error) {
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

				packageJson.scripts.start = `node ${executionPath}`;
				writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

				console.info('package.json created.');

				const indexContent = 'console.log("Hello World!");';
				writeFile(`${projectPath}/src/index.ts`, indexContent);

				resolve();
			});
		});
	}

	private async configureTypescript(projectPath: string): Promise<void> {
		console.info('Installing typescript...');
		return new Promise((resolve, reject) => {
			exec('npm install typescript -g ', { cwd: projectPath}, (error) => {
				if (error) {
					reject(error);
					return;
				}
				console.info('Typescript installed.');

				console.info('Creating tsconfig.json...');
				exec('tsc --init --baseUrl "./src" --rootDir "./src" --outDir "./dist"', { cwd: projectPath }, (error) => {
					if (error) {
						reject(error);
						return;
					}

					console.info('tsconfig.json created.');
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
			writeFile(`${projectPath}/mag.config.json`, JSON.stringify(config, null, 2));
		} catch (error) {
			throw new Error('Could not create config file');
		}
	}

	private async installMagDependencies(projectPath: string): Promise<void> {
		return new Promise((resolve, reject) => {
			exec('npm install modern-architecture-generator --save-dev', { cwd: projectPath }, (error) => {
				if (error) {
					reject('Could not install mag dependencies');
					return;
				}

				resolve();
			});
		});
	}

	async run(options: CreateProjectOptions): Promise<string> {
		const executionPath = process.cwd();
		const projectPath = options.path ?? executionPath;

		validatePath(projectPath);

		console.info('Creating folder...');
		const newFolderPath = `${projectPath}/${options.name}`;
		await this.createDirectory(newFolderPath);
		console.info('Folder created.');

		console.info('Creating project structure...');
		this.createDocumentation(options.type, newFolderPath);
		this.createFolderStructure(newFolderPath);
		this.createDefaultConfigFile(options.type, newFolderPath);
		console.info('Project structure created.');

		await this.createPackageJson(options, newFolderPath);
		await this.configureTypescript(newFolderPath);

		console.info('Installing mag dependencies...');
		this.installMagDependencies(newFolderPath);
		console.info('Dependencies installed.');

		return newFolderPath;
	}
}
