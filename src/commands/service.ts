import validateDTO from 'validators/validate';
import { CommandArgument, CommandOption, CustomCommand } from 'utils/singleton/command';
import { CreateService } from 'lib/service';
import { ValidateNameDTO } from 'validators/shared/name.dto';

const commandArguments: CommandArgument[] = [
	{
		type: 'string',
		value: 'name',
		description: 'Name of the service',
	},
];

const options: CommandOption[] = [
	{
		command: '-t, --tests',
		description: 'Create tests file',
		value: 'tests',
	},
];

type CommandOptions = {
	tests: boolean;
};

type CommandArguments = {
	name: string;
};

export default CustomCommand.createCustomCommand<unknown, CommandOptions, CommandArguments>(
	'service',
	'Creates a new service',
	async (response) => {
		await validateDTO(response, ValidateNameDTO);
		const { name } = response;

		try {
			const createService = new CreateService();
			await createService.run({
				name,
				createTests: response.tests,
			});
		} catch (error) {
			throw new Error(`Error creating service: ${(error as Error).message}`);
		}
	},
	{ arguments: commandArguments, options }
);
