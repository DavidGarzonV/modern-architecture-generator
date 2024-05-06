import { exec } from 'child_process';
import fs from 'fs';
import prompts from 'prompts';
import { CreateProjectOptions } from 'types/create';
import {
	ARCHITECTURE_KEYWORDS,
	EnabledArchitectures,
	README_PATH,
	README_PUBLIC_PATH,
} from 'constants/constants';

export default class CreateProject {
	private validatePath(path: string): void {
		try {
			fs.accessSync(path, fs.constants.F_OK);
		} catch (error) {
			throw new Error('Invalid path');
		}
	}

	private async createDirectory(path: string): Promise<void> {
		if (fs.existsSync(path)) {
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

			fs.rmSync(path, { recursive: true });
		}

		try {
			fs.mkdirSync(path);
		} catch (error) {
			throw new Error('Could not create directory');
		}
	}

	private createDocumentation(type: EnabledArchitectures, newFolderPath: string): void {
		try {
			const projectPath = process.cwd();
			fs.copyFileSync(
				`${projectPath}/${README_PATH}/${type}.md`,
				`${newFolderPath}/README.md`
			);

			fs.mkdirSync(`${newFolderPath}/public`);

			const resourcesPath = `${projectPath}/${README_PUBLIC_PATH}/${type}`;
			const files = fs.readdirSync(resourcesPath);

			files.forEach((file) => {
				fs.copyFileSync(
					`${resourcesPath}/${file}`,
					`${newFolderPath}/public/${file}`
				);
			});
		} catch (error) {
			throw new Error('Could not create documentation');
		}
	}

	private createFoldersFromObject(value: object, newFolderPath: string): void {
		Object.entries(value).forEach(([key, value]) => {
			fs.mkdirSync(`${newFolderPath}/${key}`);

			if (Object.keys(value).length > 0) {
				this.createFoldersFromObject(value, `${newFolderPath}/${key}`);
			}
		});
	}

	private createFolderStructure(type: EnabledArchitectures, newFolderPath: string): void {
		const projectPath = process.cwd();
		const jsonFile = fs.readFileSync(`${projectPath}/src/constants/folder-structure/${type}.json`, 'utf-8');

		const folderStructure = JSON.parse(jsonFile);
		const srcPath = `${newFolderPath}/src`;
		fs.mkdirSync(srcPath);

		this.createFoldersFromObject(folderStructure, srcPath);
	}

	private async createPackageJson(options: CreateProjectOptions, projectPath: string): Promise<void> {
		const { name: projectName, typescript: useTypescript } = options;

		console.info('Creating npm project...');

		return new Promise((resolve, reject) => {
			exec('npm init -y', { cwd: projectPath }, (error) => {
				if (error) {
					reject(error);
					return;
				}
	
				const packageJsonPath = `${projectPath}/package.json`;
				const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
				packageJson.name = projectName;
				packageJson.main = 'index.js';
				packageJson.author = 'MAG CLI Tool';
				packageJson.description = 'Project created with the MAG CLI tool';
				packageJson.keywords = ARCHITECTURE_KEYWORDS[options.type];

				const executionPath = useTypescript ? 'dist/index.js' : 'src/index.js';
				if (useTypescript) {
					packageJson.keywords.push('typescript');
					packageJson.scripts.build = 'tsc';
				}

				packageJson.scripts.start = `node ${executionPath}`;
				fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

				console.info('package.json created.');

				const indexContent = 'console.log("Hello World!");';
				fs.writeFileSync(`${projectPath}/src/index.${useTypescript ? 'ts' : 'js'}`, indexContent);

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

	async run(options: CreateProjectOptions): Promise<string> {
		const executionPath = process.cwd();
		const projectPath = options.path ?? executionPath;

		this.validatePath(projectPath);

		console.info('Creating folder...');
		const newFolderPath = `${projectPath}/${options.name}`;
		await this.createDirectory(newFolderPath);
		console.info('Folder created.');

		console.info('Creating project structure...');
		this.createDocumentation(options.type, newFolderPath);
		this.createFolderStructure(options.type, newFolderPath);
		console.info('Project structure created.');

		await this.createPackageJson(options, newFolderPath);
		if (options.typescript) {
			await this.configureTypescript(newFolderPath);
		}

		return newFolderPath;
	}
}
