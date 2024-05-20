import { enabledConfigurationKeys } from 'constants/constants';
import { ConfigurationOptions, MagConfiguration } from 'constants/types';
import fs from 'fs';

// TODO - Validate values and types
const validateConfigurationOptions = (config: object): void => {
	const keys = Object.keys(config);

	keys.forEach((key) => {
		if (!enabledConfigurationKeys.includes(key as ConfigurationOptions)) {
			throw new Error(`Invalid configuration option: ${key}`);
		}
	});
};

export const getProjectConfiguration = (): MagConfiguration => {
	const configFileName = 'mag.config.json';
	const projectPath = process.cwd();
	const originalConfiguration = `${projectPath}/src/templates/${configFileName}`;
	let customConfigurationPath = configFileName;

	if (process.env.NODE_ENV === 'local') {
		customConfigurationPath = `${projectPath}/test-environment/${configFileName}`;
	}

	const originalConfig = JSON.parse(fs.readFileSync(originalConfiguration, 'utf8'));
	let finalConfig: MagConfiguration = originalConfig;

	if (fs.existsSync(customConfigurationPath)) {
		const customConfig = JSON.parse(fs.readFileSync(customConfigurationPath, 'utf8'));
		validateConfigurationOptions(customConfig);
		finalConfig = { ...originalConfig, ...customConfig };
	}

	if (!finalConfig.architecture) {
		throw new Error('Architecture not defined in configuration');
	}

	return finalConfig;
};