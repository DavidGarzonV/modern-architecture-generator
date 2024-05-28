import { EnabledArchitectures } from 'constants/constants';
import { CreateDrivenPort } from 'lib/hexagonal/drivenp';
import validateDTO from 'validators/validate';
import { ValidateEntityDTO } from 'validators/shared/entity.dto';
import { ValidateNameDTO } from 'validators/shared/name.dto';
import { CommandArgument, CommandOption, CustomCommand } from 'utils/singleton/command';
import { ContextsManager } from 'utils/singleton/contexts-manager';

const commandArguments: CommandArgument[] = [
	{
		type: 'string',
		value: 'name',
		description: 'Name of the driven port',
	},
];

const options: CommandOption[] = [{
	command: '-e, --entity <entity>',
	description: 'Name of the entity related to the driven port',
	value: 'entity',
}];

type CommandArguments = {
	name: string;
};

type CommandOptions = {
	entity?: string;
}

export default CustomCommand.createCustomCommand<unknown, CommandOptions, CommandArguments>(
	'drivenp',
	'Creates a new driven port',
	async ({ name , entity }) => {
		await validateDTO({ entity }, ValidateEntityDTO);
		await validateDTO({ name }, ValidateNameDTO);

		const context = await ContextsManager.getContextName('driven-ports');

		try {
			const adapter = new CreateDrivenPort();
			await adapter.run({ name, entity, contextName: context });
		} catch (error) {
			throw new Error(
				`Error creating driven port, ${(error as Error).message}`
			);
		}
	},
	{
		arguments: commandArguments,
		options,
		architecture: EnabledArchitectures.Hexagonal,
	}
);