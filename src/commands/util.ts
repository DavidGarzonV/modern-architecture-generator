import { ValidateNameDTO } from 'validators/shared/name.dto';
import validateDTO from 'validators/validate';
import { CommandArgument, CommandQuestion, CustomCommand } from 'utils/singleton/command';
import { CreateUtil } from 'lib/util';

const commandArguments: CommandArgument[] = [
	{
		type: 'text',
		value: 'name',
		description: 'What is the name of the util?',
	}
];

type CommandArguments = {
	name: string;
};

const questions: CommandQuestion[] = [
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
}

export default CustomCommand.createCustomCommand<CommandQuestions, unknown, CommandArguments>(
	'util',
	'Creates a new util',
	async ({ name, useClass }) => {
		await validateDTO({ name }, ValidateNameDTO);

		try {
			const createUtil = new CreateUtil();
			await createUtil.run(name, useClass);
		} catch (error) {
			throw new Error(`Error creating util: ${(error as Error).message}`);
		}
	},
	{ arguments: commandArguments, questions }
);
