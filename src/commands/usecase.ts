import CreateUseCase from 'lib/usecase';
import validateDTO from 'validators/validate';
import { UseCaseDTO } from 'validators/usecase.dto';
import { CommandArgument, CommandOption, CustomCommand } from 'utils/singleton/command';
import { ContextsManager } from 'utils/singleton/contexts-manager';

const commandArguments: CommandArgument[] = [
	{
		type: 'string',
		value: 'name',
		description: 'Name of the use case',
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
	'usecase',
	'Creates a new use case',
	async (response) => {
		await validateDTO(response, UseCaseDTO);
		const { name } = response;

		const context = await ContextsManager.getContextName('use-cases', true);

		try {
			const createUseCase = new CreateUseCase();
			await createUseCase.run({
				name,
				contextName: context,
				createTests: response.tests,
			});
		} catch (error) {
			throw new Error(`Error creating use case: ${(error as Error).message}`);
		}
	},
	{ arguments: commandArguments, options }
);
