import { PromptObject } from 'prompts';
import { EnabledArchitectures } from 'constants/constants';
import { ContextsManager } from 'lib/shared/contexts-manager';
import { ProjectStructure } from 'lib/shared/project-structure';
import CreateAdapter from 'lib/clean/adapter';
import { createCustomCommand } from 'utils/command';
import { askOptionFromDirectory } from 'utils/questions';

const questions: PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'Name of the adapter:',
	},
];

type CommandQuestions = {
	name: string;
};

export default createCustomCommand<CommandQuestions>(
	'adapter',
	'Creates a new infrastructure adapter',
	async ({ name }) => {
		const projectStructure = new ProjectStructure();
		const folder = projectStructure.findFolderPathByName('interface-adapters');

		const iadapter = await askOptionFromDirectory(
			'Name of the interface adapter to implements:',
			folder,
			'.repository.ts'
		);

		const contextsManager = new ContextsManager();
		const context = await contextsManager.getContextName('adapters');

		try {
			const adapter = new CreateAdapter();
			await adapter.run({
				name,
				iadapter,
				contextName: context,
			});
		} catch (error) {
			throw new Error(`Error creating adapter, ${(error as Error).message}`);
		}
	},
	{
		questions,
		architecture: EnabledArchitectures.Clean,
	}
);
