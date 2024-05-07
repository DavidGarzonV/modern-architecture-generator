import { CreateUseCaseOptions } from 'types/usecase';
import { formatName, formatNameAttributes } from 'utils/string';
import { getProjectConfiguration } from 'utils/config';
import { FolderItem } from 'constants/types';
import { ProjectStructure } from 'lib/shared/project-structure';
import { createFolder, pathExists, readFile, writeFile } from 'utils/file';

export default class CreateUseCase extends ProjectStructure{
	private useCasesFolder: string = '';

	private organizeParentFolder(item: FolderItem, basePath: string = ''): string {
		if (item.parent) {
			const findParent = this.projectStructure.find((folder) => folder.name === item.parent);
			const parentPath = this.organizeParentFolder(findParent!, basePath);

			createFolder(parentPath);

			return `${parentPath}/${item.name}`;
		}else{
			return `${basePath}/${item.name}`;
		}
	}

	private findUseCasesFolder(): string{
		const useCasesFolder = this.projectStructure.find((item) => item.name === 'use-cases');
		if (!useCasesFolder) {
			throw new Error('Could not find use cases folder');
		}

		const executionPath = process.cwd();
		const srcPath = `${executionPath}/src`;

		return this.organizeParentFolder(useCasesFolder, srcPath);
	}

	private setUseCasesFolder(): void {
		const { useCasesFolder } = getProjectConfiguration();
		if (useCasesFolder) {
			this.useCasesFolder = useCasesFolder;
		}else{
			const defaultUseCasesFolder = this.findUseCasesFolder();
			this.useCasesFolder = defaultUseCasesFolder;
		}

		if (!this.useCasesFolder) {
			throw new Error('Could not find use cases folder');
		}

		createFolder(this.useCasesFolder);
	}

	private createContext(contextName: string): string { 
		try {
			if (pathExists(this.useCasesFolder)) {
				const contextFolder = `${this.useCasesFolder}/${contextName}`;
				createFolder(contextFolder);
				return contextFolder;
			}
		} catch (error) {
			throw new Error('Could not create context');
		}

		return this.useCasesFolder;
	}

	private createClass(name: string, path: string): void {
		const projectPath = process.cwd();
		const useCaseTemplate = readFile(`${projectPath}/src/templates/use-cases/index.ts`);
		const content = useCaseTemplate.replace(/UseCaseName/g, name);

		try {
			writeFile(`${path}/${name}.usecase.ts`, content);
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
		const architecture = getProjectConfiguration().architecture;

		this.setProjectStructure(architecture);
		this.setUseCasesFolder();

		const pascalCaseName = formatName(options.name);

		if (options.useContext) {
			const pascalCaseContextName = formatName(options.contextName);
			const contextPath = this.createContext(pascalCaseContextName);

			if (pathExists(this.useCasesFolder)) {
				createFolder(pascalCaseContextName);
			}

			this.useCasesFolder = contextPath;
		}

		const useCasePath = `${this.useCasesFolder}/${pascalCaseName}`;
		createFolder(useCasePath);

		this.createClass(pascalCaseName, useCasePath);

		if (options.createTests) {
			this.createTestsFile(pascalCaseName, useCasePath);
		}
	}
}