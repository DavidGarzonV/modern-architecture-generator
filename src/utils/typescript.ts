import { pathExists } from 'utils/file';
import ts, { Identifier } from 'typescript';
import {
	TypescriptDeclarationType,
	TypescriptFileResponse,
	TypescriptInterfaceType,
} from 'constants/types';

export const readTypescriptConfig = (): ts.CompilerOptions | null => {
	const configFilePath = 'tsconfig.json';
	const executionPath = process.cwd();
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
