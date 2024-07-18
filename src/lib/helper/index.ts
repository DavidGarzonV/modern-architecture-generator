import Loader from 'node-cli-loader';
import { ProjectStructure } from 'lib/shared/project-structure';
import { createDirectory, writeFile } from 'utils/file';
import { clearName, convertToCamelCase, convertToPascalCase, formatPath } from 'utils/string';

export type HelperType = 'application' | 'domain' | 'shared' | 'infrastructure';

export class CreateHelper {
	private _ps: ProjectStructure;

	constructor(){
		this._ps = new ProjectStructure();
	}

	private getHelperClassContent(name: string, type: HelperType) {
		const content = `export class ${convertToPascalCase(name)}Helper {`
		+ '\n\tconstructor() {}'
		+ `\n\t// Add your ${type} helper logic here`
		+ '\n}';

		return content;
	}

	private getHelperFunctionContent(name: string, type: HelperType) {
		const content = `export const ${convertToCamelCase(name)} = () => {`
		+`\n\t// Add your ${type} helper logic here\n}`;
		return content;
	}

	private getHelperContent(name: string, type: HelperType, useClass?: boolean) {
		const helperContent = useClass ? this.getHelperClassContent(name, type) : this.getHelperFunctionContent(name, type);
		return helperContent;
	}

	async run(name: string, type: HelperType, useClass?: boolean) {
		Loader.create('Creating helper...');

		const helperType = `${type}-helpers`;
		const folderByType = this._ps.findFolderPathByName(helperType);
		const finalPath = folderByType.replace(helperType, 'helpers');
		createDirectory(finalPath);

		const helperContent = this.getHelperContent(name, type, useClass);
		const helperName = await this._ps.askForCreateProjectFile(clearName(name), finalPath, 'helper');

		const helperPath = `${finalPath}/${helperName}.helper.ts`;
		writeFile(helperPath, helperContent);

		Loader.stopAll();
		console.info(`Helper ${helperName} created in ${formatPath(helperPath)}`);
	}
}