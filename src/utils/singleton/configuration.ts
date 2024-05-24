import fs from 'fs';
import path from 'path';
import { enabledConfigurationKeys } from 'constants/constants';
import { ConfigurationOptions, MagConfiguration } from 'constants/types';
import { CustomCommand } from 'utils/singleton/command';

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
		return path.join(__dirname, '../../../').slice(0, -1);
	}

	public static validateMagAndConfig(): void {
		const projectPath = CustomCommand.getExecutionPath();
		const configPath = `${projectPath}/${Configuration.configurationFile}`;

		if (!fs.existsSync(configPath)) {
			throw new Error('This is not a mag project');
		}

		const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
		Configuration.validateConfigurationOptions(config);
	}

	public static validateConfigurationFile(): void {
		const projectPath = CustomCommand.getExecutionPath();
		const configPath = `${projectPath}/${Configuration.configurationFile}`;

		if (!fs.existsSync(configPath)) {
			throw new Error('Configuration file not found');
		}
	}

	private static getProjectConfiguration(): MagConfiguration {
		const baseMagPath = Configuration.getMagPath();

		const defaultConfigFile = `${baseMagPath}/src/templates/${Configuration.configurationFile}`;
		const originalConfig = JSON.parse(fs.readFileSync(defaultConfigFile, 'utf8'));
		let finalConfig: MagConfiguration = originalConfig;

		const projectPath = CustomCommand.getExecutionPath();
		let customConfigurationPath = '';
		if (process.env.NODE_ENV === 'local') {
			customConfigurationPath = `${projectPath}/test-environment/${Configuration.configurationFile}`;
		}else{
			customConfigurationPath = `${projectPath}/${Configuration.configurationFile}`;
		}

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

	public static get (key: ConfigurationOptions): MagConfiguration[typeof key]{
		const configuration = Configuration.getProjectConfiguration();
		return configuration[key];
	}
}