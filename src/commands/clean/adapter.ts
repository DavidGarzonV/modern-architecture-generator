import { program } from 'commander';
import prompts from 'prompts';

import { EnabledArchitectures } from 'constants/constants';
import { ArchitectureManager } from 'lib/shared/architecture-manager';
import { ContextsManager } from 'lib/shared/contexts-manager';
import { ProjectStructure } from 'lib/shared/project-structure';
import { pathExists, readDirectory } from 'utils/file';
import CreateAdapter from 'lib/clean/adapter';

const getRepositories = (folder: string): prompts.Choice[]  => {
	const items = readDirectory(folder);
	let contexts: prompts.Choice[] = [];

	items.forEach((item) => {
		if (item.includes('.repository.ts')) {
			const fileName = item.replace('.repository.ts', '');
			contexts.push({ title: fileName, value: fileName });
		}else{
			const subItems = getRepositories(`${folder}/${item}`);
			contexts = [...contexts, ...subItems];
		}
	});
	return contexts;
};

const getInterfaceAdapters = (): prompts.Choice[] => {
	const projectStructure = new ProjectStructure();
	const folder = projectStructure.findFolderPathByName('interface-adapters');

	if (pathExists(folder)) {
		return getRepositories(folder);
	}

	return [];
};

const questions: prompts.PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'Name of the adapter:',
	}
];

export default program
	.createCommand('adapter')
	.hook('preAction', () => {
		const result = new ArchitectureManager().validateProjectArchitecture(
			EnabledArchitectures.Clean
		);
		if (!result) {
			throw new Error(
				'Invalid project architecture. This command is only available for Clean Architecture projects.'
			);
		}
	})
	.description('Creates a new infrastructure adapter')
	.action(async () => {
		const interfaceAdapters = getInterfaceAdapters();

		questions.push({
			type: 'autocomplete',
			name: 'iadapter',
			message: 'Name of the interface adapter to implements:',
			choices: interfaceAdapters
		});

		const { name, iadapter } = await prompts(questions);

		const contextsManager = new ContextsManager();
		const context = await contextsManager.getContextName('adapters');

		try {
			const adapter = new CreateAdapter();
			await adapter.run({ 
				name,
				iadapter,
				contextName: context
			});
		} catch (error) {
			console.log('.action -> error:', error);

			throw new Error(
				`Error creating adapter, ${(error as Error).message}`
			);
		}
	});
