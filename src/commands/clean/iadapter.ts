import { PromptObject } from 'prompts';
import { EnabledArchitectures } from 'constants/constants';
import CreateIAdapter from 'lib/clean/iadapter';
import { ContextsManager } from 'lib/shared/contexts-manager';
import { CommandOption, createCustomCommand } from 'utils/command';

const questions: PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'Name of the interface adapter:',
	}
];

const options: CommandOption[] = [{
	command: '-e, --entity <entity>',
	description: 'Name of the entity related to the interface adapter',
	value: 'entity',
}];

type CommandQuestions = {
	name: string;
};

type CommandOptions = {
	entity?: string;
}

export default createCustomCommand<CommandQuestions, CommandOptions>(
	'iadapter',
	'Creates a new interface adapter',
	async ({ name, entity }) => {
		const contextsManager = new ContextsManager();
		const context = await contextsManager.getContextName('interface-adapters');

		try {
			const adapter = new CreateIAdapter();
			await adapter.run({ name, entity, contextName: context });
		} catch (error) {
			throw new Error(
				`Error creating interface adapter, ${(error as Error).message}`
			);
		}
	},
	{
		questions,
		options,
		architecture: EnabledArchitectures.Clean,
	}
);