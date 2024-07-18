import { ValidateNameDTO } from 'validators/shared/name.dto';
import validateDTO from 'validators/validate';
import { CommandArgument, CommandQuestion, CustomCommand } from 'utils/singleton/command';
import { CreateHelper, HelperType } from 'lib/helper';

const commandArguments: CommandArgument[] = [
	{
		type: 'text',
		value: 'name',
		description: 'What is the name of the helper?',
	}
];

type CommandArguments = {
	name: string;
};

const questions: CommandQuestion[] = [
	{
		type: 'select',
		name: 'type',
		message: 'What type of helper do you want to create?',
		choices: [
			{ title: 'Shared helper', description: 'If is general purpose and does not strictly belong to any layer.', value: 'shared' },
			{ title: 'Application helper', description: 'If helps with application-specific logic or coordination between the domain and external systems', value: 'application' },
			{ title: 'Domain helper', description: 'If is related to core business logic and is purely computational or algorithmic, with no external dependencies.', value: 'domain' },
			{ title: 'Infrastructure helper', description: 'If interacts with external systems such as databases, web services or external libraries.', value: 'infrastructure' },
		],
		initial: 0,
	},
	{
		type: 'toggle',
		name: 'useClass',
		message: 'Use class instead of function?',
		initial: 0,
		inactive: 'No',
		active: 'Yes',
	},
];

type CommandQuestions = {
	useClass: boolean;
	type: HelperType;
}

export default CustomCommand.createCustomCommand<CommandQuestions, unknown, CommandArguments>(
	'helper',
	'Creates a new helper',
	async ({ name, type, useClass }) => {
		await validateDTO({ name }, ValidateNameDTO);

		try {
			const createHelper = new CreateHelper();
			await createHelper.run(name, type, useClass);
		} catch (error) {
			throw new Error(`Error creating helper: ${(error as Error).message}`);
		}
	},
	{ arguments: commandArguments, questions }
);
