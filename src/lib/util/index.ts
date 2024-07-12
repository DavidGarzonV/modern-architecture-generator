import { ProjectStructure } from 'lib/shared/project-structure';
import { createDirectory, writeFile } from 'utils/file';
import { formatName } from 'utils/string';

export class CreateUtil {
	private _ps: ProjectStructure;

	constructor(){
		this._ps = new ProjectStructure();
	}

	private getContent(name: string, useClass?: boolean): string {
		let utilTemplate = `export const ${name} = () => {\n\t// Your code here\n};\n`;
		if (useClass) {
			utilTemplate = `export class ${formatName(name)} {\n\tconstructor() {\n\t\t// Your code here\n\t}`;
			utilTemplate += '\n\n\tstatic ' + name + '(){}';
			utilTemplate += '\n}\n';
		}
		return utilTemplate;
	}

	private async createUtility(name: string, useClass?: boolean): Promise<void> {
		const utilitiesFolder = this._ps.findFolderPathByName('utils');
		const utilityName = await this._ps.askForCreateProjectFile(name, utilitiesFolder, 'port');
		const content = this.getContent(name, useClass);

		createDirectory(utilitiesFolder);
		writeFile(`${utilitiesFolder}/${utilityName}.ts`, content);
	}

	async run(name: string, useClass?: boolean) {
		console.info(`Creating util with name: ${name}`);
		await this.createUtility(name, useClass);
		console.info(`Util ${name} created!`);
	}
}