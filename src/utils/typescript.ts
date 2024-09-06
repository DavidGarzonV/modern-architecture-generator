import { pathExists, writeFile } from 'utils/file';
import ts, { Identifier } from 'typescript';
import {
	TypescriptDeclarationType,
	TypescriptFileResponse,
	TypescriptInterfaceType,
} from 'constants/types';
import { CustomCommand } from 'utils/singleton/command';

export interface TypescriptConfig {
	compilerOptions: ts.CompilerOptions;
	include: string[];
	exclude: string[];
}

const readTypescriptConfig = (): ts.CompilerOptions | null => {
	const configFilePath = 'tsconfig.json';
	const executionPath = CustomCommand.getExecutionPath();
	const srcPath = `${executionPath}/${configFilePath}`;

	if (pathExists(srcPath)) {
		const configFile = ts.readConfigFile(configFilePath, ts.sys.readFile);
		const config = ts.parseJsonConfigFileContent(
			configFile.config,
			ts.sys,
			executionPath
		);
		return config.options;
	}

	return null;
};

export const readTypescriptConfigFile = (): TypescriptConfig | null => {
	const configFilePath = 'tsconfig.json';
	const executionPath = CustomCommand.getExecutionPath();
	const srcPath = `${executionPath}/${configFilePath}`;

	try {
		if (pathExists(srcPath)) {
			const fileText = ts.readJsonConfigFile(srcPath, ts.sys.readFile).getFullText();
			// eslint-disable-next-line prefer-const
			let tsConfig: TypescriptConfig | null = null;
			eval(`tsConfig = ${fileText};`);
			return tsConfig;
		}
	} catch (error) {
		console.error(`Error reading tsconfig.json file: ${error}`);
	}

	return null;
};

export const updateTypescriptConfig = (configuration: object): void => {
	const configFilePath = 'tsconfig.json';
	const executionPath = CustomCommand.getExecutionPath();
	const srcPath = `${executionPath}/${configFilePath}`;
	writeFile(srcPath, JSON.stringify(configuration, null, 2));
};

const getNodeType = (node: ts.TypeElement & { type?: ts.TypeNode }) => {
	return node.type;
};

export const readTypescriptFile = async (path: string): Promise<TypescriptFileResponse | null> => {
	const currentConfig = readTypescriptConfig();

	if (pathExists(path) && currentConfig) {
		const program = ts.createProgram([path], {
			module: currentConfig.module,
			target: currentConfig.target,
		});

		const file = program.getSourceFile(path);
		if (file) {
			const interfaces: TypescriptInterfaceType[] = [];
			const classes: string[] = [];
			const functions: string[] = [];

			ts.forEachChild<void>(file, (node) => {
				if (ts.isInterfaceDeclaration(node)) {
					const declarations: TypescriptDeclarationType[] = [];
					const name =  node.name.text;

					node.members.forEach((member) => {
						const typeChecker = program.getTypeChecker();
						const type = typeChecker.getTypeAtLocation(getNodeType(member)!);
						const stringType = typeChecker.typeToString(type);

						declarations.push({
							name: (member.name as Identifier).escapedText.toString(),
							type: stringType
						});
					});

					interfaces.push({
						name,
						declarations
					});
				}
			});

			return {
				interfaces,
				classes,
				functions,
				text: file.getText()
			};
		}
	}

	return null;
};
