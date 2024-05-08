import { CreateUseCaseOptions } from 'types/usecase';
import { formatName, formatNameAttributes } from 'utils/string';
import { getProjectConfiguration } from 'utils/config';
import { ProjectStructure } from 'lib/shared/project-structure';
import { createFolder, pathExists, readFile, writeFile } from 'utils/file';
import prompts from 'prompts';

export default class CreateUseCase extends ProjectStructure{
	private useCasesFolder: string = '';
	
	constructor(){
		super();
	}

	private setUseCasesFolder(): void {
		const { useCasesFolder } = getProjectConfiguration();
		if (useCasesFolder) {
			this.useCasesFolder = useCasesFolder;
		}else{
			const defaultUseCasesFolder = this.findFolderPathByName('use-cases');
			this.useCasesFolder = defaultUseCasesFolder;
		}

		if (!this.useCasesFolder) {
			throw new Error('Could not find use cases folder');
		}

		createFolder(this.useCasesFolder);
	}

	private async createClass(name: string, path: string): Promise<void> {
		const projectPath = process.cwd();
		const useCaseTemplate = readFile(`${projectPath}/src/templates/use-cases/index.txt`);

		try {
			let useCaseName = name;
			if (pathExists(`${path}/${name}/${name}.usecase.ts`)) {
				const { overwrite, newName } = await prompts([
					{
						type: 'confirm',
						name: 'overwrite',
						message: `The use case ${name} already exists. Do you want to overwrite it?`,
						initial: false,
					},
					{
						type: (prev) => (!prev ? 'text' : null),
						name: 'newName',
						message: 'What is the new name?',
					},
				]);

				if (!overwrite) {
					useCaseName = formatName(newName);
				}
			}

			const content = useCaseTemplate.replace(/UseCaseName/g, useCaseName);
			createFolder(`${path}/${useCaseName}`);
			writeFile(`${path}/${useCaseName}/${useCaseName}.usecase.ts`, content);
		} catch (error) {
			throw new Error('Could not create class');
		}
	}

	private createTestsFile(name: string, path: string): void {
		const projectPath = process.cwd();
		const useCaseTemplate = readFile(`${projectPath}/src/templates/use-cases/test.txt`);

		let content = useCaseTemplate.replace(/UseCaseName/g, name);
		content = content.replace(/useCase/g, formatNameAttributes(name));

		try {
			writeFile(`${path}/${name}.spec.ts`, content);
		} catch (error) {
			throw new Error('Could not create tests file');
		}
	}

	// TODO - Check if add request and response files
	async run(options: CreateUseCaseOptions): Promise<void>{
		console.info('Creating use case...');
		this.setUseCasesFolder();

		const pascalCaseName = formatName(options.name);

		if (options.useContext && options.contextName) {
			const pascalCaseContextName = formatName(options.contextName);
			const contextPath = this.createContextFolder(this.useCasesFolder, pascalCaseContextName);

			if (pathExists(this.useCasesFolder)) {
				createFolder(pascalCaseContextName);
			}

			this.useCasesFolder = contextPath;
		}

		const useCasePath = `${this.useCasesFolder}`;
		createFolder(useCasePath);

		await this.createClass(pascalCaseName, useCasePath);

		if (options.createTests) {
			this.createTestsFile(pascalCaseName, useCasePath);
		}
		console.info('Use case created!');
	}
}