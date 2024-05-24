import { ProjectStructure } from 'lib/shared/project-structure';
import prompts, { Choice, PromptObject } from 'prompts';
import { pathExists, readDirectory } from 'utils/file';

export class ContextsManager {
	/**
	 * @description Get the contexts from a specific folder
	 * @private
	 * @param {string} pathToSearch
	 * @return {*}  {Promise<Choice[]>}
	 * @memberof ContextsManager
	 */
	private static async getContexts(pathToSearch: string): Promise<Choice[]> {
		const projectStructure = new ProjectStructure();
		const folder = projectStructure.findFolderPathByName(pathToSearch);
		const contexts: Choice[] = [];

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

	/**
	 * @description Ask for the context name and search options
	 * @param {string} pathToSearch
	 * @return {*}  {(Promise<string | undefined>)}
	 * @memberof ContextsManager
	 */
	public static async getContextName(pathToSearch: string): Promise<string | undefined> {
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
			const currentContexts = await ContextsManager.getContexts(pathToSearch);
			let contextQuestion: PromptObject | undefined;

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
