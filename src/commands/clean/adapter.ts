import { EnabledArchitectures } from 'constants/constants';
import CreateAdapter from 'lib/clean/adapter';
import { askOptionFromDirectory } from 'utils/questions';
import { CommandArgument, CustomCommand } from 'utils/singleton/command';
import { ProjectStructure } from 'lib/shared/project-structure';
import { ContextsManager } from 'utils/singleton/contexts-manager';
import prompts from 'prompts';
import { createInterfaceAdapter } from 'commands/clean/iadapter';

const commandArguments: CommandArgument[] = [
	{
		type: 'string',
		value: 'name',
		description: 'Name of the adapter',
	},
];

type CommandArguments = {
	name: string;
};

export default CustomCommand.createCustomCommand<unknown, unknown, CommandArguments>(
	'adapter',
	'Creates a new infrastructure adapter',
	async ({ name }) => {
		const projectStructure = new ProjectStructure();
		const folder = projectStructure.findFolderPathByName('interface-adapters');

		let iadapter = await askOptionFromDirectory(
			'Name of the interface adapter to implements:',
			folder,
			'.repository.ts'
		);

		if (!iadapter) {
			const { createNewInterfaceAdapter } = await prompts([
				{
					type: 'confirm',
					name: 'createNewInterfaceAdapter',
					message: 'Do you want to create a new interface adapter?',
				},
			]);

			if (createNewInterfaceAdapter) {
				iadapter = await createInterfaceAdapter(name, undefined, undefined);
			}else{
				throw new Error('No interface adapters found');
			}
		}

		try {
			const context = await ContextsManager.getContextName('adapters');

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
		arguments: commandArguments,
		architecture: EnabledArchitectures.Clean,
	}
);
