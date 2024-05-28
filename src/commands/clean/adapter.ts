import { PromptObject } from 'prompts';
import { EnabledArchitectures } from 'constants/constants';
import CreateAdapter from 'lib/clean/adapter';
import { askOptionFromDirectory } from 'utils/questions';
import { CustomCommand } from 'utils/singleton/command';
import { ProjectStructure } from 'lib/shared/project-structure';
import { ContextsManager } from 'utils/singleton/contexts-manager';

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

export default CustomCommand.createCustomCommand<CommandQuestions>(
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

		if (!iadapter) {
			throw new Error('No interface adapters found');
		}

		const context = await ContextsManager.getContextName('adapters');

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
