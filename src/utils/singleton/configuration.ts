import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import Loader from 'node-cli-loader';
import { EnabledArchitectures, enabledConfigurationKeys } from 'constants/constants';
import { ConfigurationOptions, MagConfiguration } from 'constants/types';
import { CustomCommand } from 'utils/singleton/command';
import { writeFile } from 'utils/file';

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

	public static getMagPath(): string {
		let magPath = path.join(__dirname, '../../../').slice(0, -1);
		if (process.env.NODE_ENV === 'local') {
			magPath += '/src';
		}else{
			magPath += '/dist';
		}
		return magPath;
	}

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
}