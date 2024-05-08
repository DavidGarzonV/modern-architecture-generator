import { ProjectStructure } from 'lib/shared/project-structure';
import prompts from 'prompts';
import { pathExists, readDirectory } from 'utils/file';

export class ContextsManager {
	private _projectStructure: ProjectStructure;

	constructor(){
		this._projectStructure = new ProjectStructure();
	}

	private async getContexts(pathToSearch: string): Promise<prompts.Choice[]> {
		const folder = this._projectStructure.findFolderPathByName(pathToSearch);
		const contexts: prompts.Choice[] = [];

		if (pathExists(folder)) {
			const folders = readDirectory(folder);
			folders.forEach((folder) => {
				const contents = readDirectory(`${folder}/${folder}`);
				const hasFiles = contents.some((content) => content.includes('.'));
				if (!hasFiles) {
					contexts.push({ title: folder, value: folder });
				}
			});
		}

		return contexts;
	}

	async getContextName(pathToSearch: string): Promise<string | undefined> {
		let context = undefined;

		const { useContext } = await prompts([
			{
				type: 'toggle',
				name: 'useContext',
				message: 'The item belongs to a context?',
				initial: false,
				active: 'yes',
				inactive: 'no',
			}
		]);

		if (useContext) {
			const currentContexts = await this.getContexts(pathToSearch);
			let contextQuestion: prompts.PromptObject | undefined;

			if (currentContexts.length > 0) {
				contextQuestion = {
					type: 'select',
					name: 'contextName',
					message: 'Select the context:',
					choices: currentContexts,
				};
			} else {
				contextQuestion = {
					type: 'text',
					name: 'contextName',
					message: 'What is the context name?',
				};
			}

			const { contextName } = await prompts([contextQuestion]);
			context = contextName;
		}

		return context;
	}
}
