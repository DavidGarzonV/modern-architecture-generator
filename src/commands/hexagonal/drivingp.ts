import { CreateDrivingPort } from 'lib/hexagonal/drivingp';
import validateDTO from 'validators/validate';
import { ValidateNameDTO } from 'validators/shared/name.dto';
import { EnabledArchitectures } from 'constants/constants';
import { CommandArgument, CustomCommand } from 'utils/singleton/command';
import { ContextsManager } from 'utils/singleton/contexts-manager';

const commandArguments: CommandArgument[] = [
	{
		type: 'string',
		value: 'name',
		description: 'Name of the driving port',
	},
];

type CommandArguments = {
	name: string;
};

export default CustomCommand.createCustomCommand<unknown, unknown, CommandArguments>(
	'drivingp',
	'Creates a new driving port',
	async ({ name }) => {
		await validateDTO({ name }, ValidateNameDTO);

		const context = await ContextsManager.getContextName('driving-ports');

		try {
			const adapter = new CreateDrivingPort();
			await adapter.run({ name, contextName: context });
		} catch (error) {
			throw new Error(
				`Error creating driving port, ${(error as Error).message}`
			);
		}
	},
	{
		arguments:commandArguments,
		architecture: EnabledArchitectures.Hexagonal,
	}
);