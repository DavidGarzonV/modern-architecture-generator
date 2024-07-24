import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import Loader from 'node-cli-loader';
import { EnabledArchitectures, enabledConfigurationKeys } from 'constants/constants';
import { ConfigurationOptions, MagConfiguration } from 'constants/types';
import { CustomCommand } from 'utils/singleton/command';
import { readFile, writeFile } from 'utils/file';
import prompts from 'prompts';

export class Configuration {
	public static configurationFile = 'mag.config.json';

	// TODO - Validate values and types
	private static validateConfigurationOptions (config: object): void  {
		const keys = Object.keys(config);

		keys.forEach((key) => {
			if (!enabledConfigurationKeys.includes(key as ConfigurationOptions)) {
				throw new Error(`Invalid configuration option: ${key}`);
			}
		});
	}

	/**
	 * @description Get the installation path of mag
	 */
	public static getMagPath(): string {
		let magPath = path.join(__dirname, '../../../').slice(0, -1);
		if (process.env.NODE_ENV === 'local') {
			magPath += '/src';
		}else{
			magPath += '/dist';
		}
		return magPath;
	}

	/**
	 * @description Get the path of the execution context folder
	 */
	public static getSourcePath(): string {
		const projectPath = CustomCommand.getExecutionPath();
		return `${projectPath}/src`;
	}

	public static validateMagAndConfig(): void {
		const projectPath = CustomCommand.getExecutionPath();
		const configPath = `${projectPath}/${Configuration.configurationFile}`;

		if (!fs.existsSync(configPath)) {
			throw new Error('This is not a mag project, run `mag configure` to start');
		}

		const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
		Configuration.validateConfigurationOptions(config);
	}

	private static getProjectConfiguration(): MagConfiguration {
		const baseMagPath = Configuration.getMagPath();

		const defaultConfigFile = `${baseMagPath}/templates/${Configuration.configurationFile}`;
		const originalConfig = JSON.parse(fs.readFileSync(defaultConfigFile, 'utf8'));
		let finalConfig: MagConfiguration = originalConfig;

		const projectPath = CustomCommand.getExecutionPath();
		const customConfigurationPath = `${projectPath}/${Configuration.configurationFile}`;

		if (fs.existsSync(customConfigurationPath)) {
			const customConfig = JSON.parse(fs.readFileSync(customConfigurationPath, 'utf8'));
			Configuration.validateConfigurationOptions(customConfig);
			finalConfig = { ...originalConfig, ...customConfig };
		}

		if (!finalConfig.architecture) {
			throw new Error('Architecture not defined in configuration');
		}

		return finalConfig;
	}

	public static createDefaultConfigFile(type: EnabledArchitectures, projectPath: string): void {
		try {
			const config: MagConfiguration = {
				architecture: type,
			};
			writeFile(`${projectPath}/${Configuration.configurationFile}`, JSON.stringify(config, null, 2));
		} catch (error) {
			throw new Error('Could not create config file');
		}
	}

	public static async installMagDependencies(projectPath: string): Promise<void> {
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

	public static get (key: ConfigurationOptions): MagConfiguration[typeof key]{
		const configuration = Configuration.getProjectConfiguration();
		return configuration[key];
	}

	public static async configureRimRaf(projectPath: string): Promise<void> {
		return new Promise((resolve, reject) => {
			exec('npm install --save-dev rimraf', { cwd: projectPath}, (error) => {
				if (error) {
					Loader.interrupt();
					reject(error);
					return;
				}

				const packageJsonPath = `${projectPath}/package.json`;
				const packageJson = JSON.parse(readFile(packageJsonPath, 'utf-8'));
				packageJson.scripts.prebuild = 'rimraf dist';
				writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

				resolve();
			});
		});
	}

	private static async configureJest(executionPath: string): Promise<void> {
		return new Promise((resolve, reject) => {
			exec('npm install --save-dev jest @types/jest', { cwd: executionPath }, (error) => {
				if (error) {
					Loader.interrupt();
					reject(error);
					return;
				}

				const packageJsonPath = `${executionPath}/package.json`;
				const packageJson = JSON.parse(readFile(packageJsonPath, 'utf-8'));
				packageJson.scripts.test = 'jest --coverage --detectOpenHandles';
				writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

				resolve();
			});
		});
	}

	private static async configureMocha(executionPath: string): Promise<void>{
		return new Promise((resolve, reject) => {
			exec('npm install --save-dev mocha @types/mocha', { cwd: executionPath }, (error) => {
				if (error) {
					Loader.interrupt();
					reject(error);
					return;
				}

				const packageJsonPath = `${executionPath}/package.json`;
				const packageJson = JSON.parse(readFile(packageJsonPath, 'utf-8'));
				packageJson.scripts.test = 'npm run build && mocha --check-leaks **/*.spec.js';
				writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

				resolve();
			});
		});
	}

	private static async configureJasmine(executionPath: string): Promise<void>{
		return new Promise((resolve, reject) => {
			exec('npm install --save-dev jasmine @types/jasmine', { cwd: executionPath }, (error) => {
				if (error) {
					Loader.interrupt();
					reject(error);
					return;
				}

				const packageJsonPath = `${executionPath}/package.json`;
				const packageJson = JSON.parse(readFile(packageJsonPath, 'utf-8'));
				packageJson.scripts.test = 'jasmine --config=./jasmine.json';
				writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

				const jasmineConfig = {
					spec_dir: '',
					spec_files: [
						'src/**/*.[sS]pec.js',
						'src/**/*.[sS]pec.ts'
					]
				};
				writeFile(`${executionPath}/jasmine.json`, JSON.stringify(jasmineConfig, null, 2));				

				resolve();
			});
		});
	}

	public static async configureTestingFramework(testingFramework: string, executionPath: string): Promise<void> {
		const packageJsonPath = `${executionPath}/package.json`;
		const packageJson = readFile(packageJsonPath, 'utf-8');
		let doneMessage = 'Testing framework configured';

		if (packageJson.includes('jest') || packageJson.includes('mocha') || packageJson.includes('jasmine')) {
			const overwriteResponse = await prompts([{
				type: 'confirm',
				name: 'value',
				message: 'Do you want to overwrite the test configuration?',
				hint: 'You will need to manually delete any unused dependencies and remove configuration files.',
				initial: false,
			}]);

			if (overwriteResponse.value === false) {
				return;
			}

			doneMessage += ', you will need to manually delete any unused dependencies and configuration files';
		}

		Loader.create(`Configuring ${testingFramework}`, { doneMessage });

		if (testingFramework === 'mocha') {
			await Configuration.configureRimRaf(executionPath);
		}

		const methodByFramework: Record<string, (executionPath: string) => Promise<void>> = {
			jest: Configuration.configureJest,
			mocha: Configuration.configureMocha,
			jasmine: Configuration.configureJasmine,
		};

		const indexContent = readFile(`${Configuration.getMagPath()}/templates/tests/${testingFramework}.txt`, 'utf-8');
		writeFile(`${executionPath}/src/index.spec.ts`, indexContent);

		return methodByFramework[testingFramework](executionPath);
	}
}