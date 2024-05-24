import { formatName, formatNameAttributes } from 'utils/string';
import { getConfigVar } from 'utils/config';
import { ProjectStructure } from 'lib/shared/project-structure';
import { createDirectory, pathExists, readFile, writeFile } from 'utils/file';

type CreateUseCaseOptions = {
	name: string;
	createTests?: boolean;
	contextName?: string;
}

export default class CreateUseCase{
	private _useCasesFolder: string = '';
	private _ps: ProjectStructure;

	constructor(){
		this._ps = new ProjectStructure();
	}

	private setUseCasesFolder(): void {
		const useCasesFolder = getConfigVar('useCasesFolder') as string | undefined;
		if (useCasesFolder) {
			this._useCasesFolder = useCasesFolder;
		}else{
			const defaultUseCasesFolder = this._ps.findFolderPathByName('use-cases');
			this._useCasesFolder = defaultUseCasesFolder;
		}
	}

	private async createClass(name: string): Promise<void> {
		const projectPath = process.cwd();
		const useCaseTemplate = readFile(`${projectPath}/src/templates/use-cases/index.txt`);

		const useCaseName = await this._ps.askForCreateProjectFile(name, this._useCasesFolder, 'usecase');
		createDirectory(this._useCasesFolder);

		const content = useCaseTemplate.replace(/UseCaseName/g, useCaseName);
		createDirectory(`${this._useCasesFolder}/${useCaseName}`);
		writeFile(`${this._useCasesFolder}/${useCaseName}/${useCaseName}.usecase.ts`, content);
	}

	private createTestsFile(name: string): void {
		const projectPath = process.cwd();
		const useCaseTemplate = readFile(`${projectPath}/src/templates/use-cases/test.txt`);

		let content = useCaseTemplate.replace(/UseCaseName/g, name);
		content = content.replace(/useCase/g, formatNameAttributes(name));

		try {
			writeFile(`${this._useCasesFolder}/${name}.spec.ts`, content);
		} catch (error) {
			throw new Error('Could not create tests file');
		}
	}

	async run(options: CreateUseCaseOptions): Promise<void>{
		console.info('Creating use case...');
		this.setUseCasesFolder();

		const pascalCaseName = formatName(options.name);

		if (options.contextName) {
			const pascalCaseContextName = formatName(options.contextName);
			const contextPath = this._ps.createContextFolder(this._useCasesFolder, pascalCaseContextName);

			if (pathExists(this._useCasesFolder)) {
				createDirectory(pascalCaseContextName);
			}

			this._useCasesFolder = contextPath;
		}

		await this.createClass(pascalCaseName);

		if (options.createTests) {
			this.createTestsFile(pascalCaseName);
		}

		console.info('Use case created!');
	}
}