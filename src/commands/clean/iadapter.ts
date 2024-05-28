import { EnabledArchitectures } from 'constants/constants';
import CreateIAdapter from 'lib/clean/iadapter';
import { CommandArgument, CommandOption, CustomCommand } from 'utils/singleton/command';
import { ContextsManager } from 'utils/singleton/contexts-manager';

const commandArguments: CommandArgument[] = [
	{
		type: 'string',
		value: 'name',
		description: 'Name of the interface adapter',
	},
];

const options: CommandOption[] = [{
	command: '-e, --entity <entity>',
	description: 'Name of the entity related to the interface adapter',
	value: 'entity',
}];

type CommandArguments = {
	name: string;
};

type CommandOptions = {
	entity?: string;
}

export default CustomCommand.createCustomCommand<unknown, CommandOptions, CommandArguments>(
	'iadapter',
	'Creates a new interface adapter',
	async ({ name, entity }) => {
		const context = await ContextsManager.getContextName('interface-adapters');

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
		arguments: commandArguments,
		options,
		architecture: EnabledArchitectures.Clean,
	}
);