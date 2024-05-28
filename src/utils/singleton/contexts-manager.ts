import { ProjectStructure } from 'lib/shared/project-structure';
import prompts, { Choice, PromptObject } from 'prompts';
import { isDirectory, pathExists, readDirectory } from 'utils/file';

export class ContextsManager {
	/**
	 * @description Get the contexts from a specific folder
	 * @private
	 * @param {string} pathToSearch The path to search the contexts
	 * @param {boolean} [onlyFolders] Define if the search should be only for folders
	 * @return {*}  {Promise<Choice[]>}
	 * @memberof ContextsManager
	 */
	private static async getContexts(pathToSearch: string, onlyFolders?: boolean): Promise<Choice[]> {
		const projectStructure = new ProjectStructure();
		const folder = projectStructure.findFolderPathByName(pathToSearch);
		const contexts: Choice[] = [];

		if (pathExists(folder) && isDirectory(folder)) {
			const items = readDirectory(folder);
			items.forEach((item) => {
				let addItem = !item.includes('.');
				if (isDirectory(`${folder}/${item}`)) {
					const contents = readDirectory(`${folder}/${item}`);

					if (onlyFolders) {
						addItem = contents.every((content) => !content.includes('.'));
					}else{
						addItem = contents.every((content) => content.includes('.'));
					}
				}

				if (addItem) {
					contexts.push({ title: item, value: item });
				}
			});
		}

		return contexts;
	}

	/**
	 * @description Ask for the context name and search options
	 * @param {string} pathToSearch The path to search the contexts
	 * @param {boolean} [onlyFolders] Define if the search should be only for folders
	 * @return {*}  {(Promise<string | undefined>)}
	 * @memberof ContextsManager
	 */
	public static async getContextName(pathToSearch: string, onlyFolders?: boolean): Promise<string | undefined> {
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
			const currentContexts = await ContextsManager.getContexts(pathToSearch, onlyFolders);
			let contextQuestion: PromptObject | undefined;

			if (currentContexts.length > 0) {
				currentContexts.push({ title: '- Create new context', value: 'new' });
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
			if (contextName === 'new') {
				const { newContext } = await prompts([
					{
						type: 'text',
						name: 'newContext',
						message: 'What is the new context name?',
					},
				]);
				context = newContext;
			}else{
				context = contextName;
			}
		}

		return context;
	}
}
