import { PromptObject } from 'prompts';
import CreateUseCase from 'lib/usecase';
import validateDTO from 'validators/validate';
import { UseCaseDTO } from 'validators/usecase.dto';
import { CommandOption, CustomCommand } from 'utils/singleton/command';
import { ContextsManager } from 'utils/singleton/contexts-manager';

const questions: PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'What is the name of the use case?',
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

type CommandQuestions = {
	name: string;
};

export default CustomCommand.createCustomCommand<CommandQuestions, CommandOptions>(
	'usecase',
	'Creates a new use case',
	async (response) => {
		await validateDTO(response, UseCaseDTO);
		const { name } = response;

		const context = await ContextsManager.getContextName('use-cases');

		try {
			const createUseCase = new CreateUseCase();
			await createUseCase.run({
				name,
				contextName: context,
				createTests: response.tests,
			});
		} catch (error) {
			console.error('Error creating use case:', (error as Error).message);
		}
	},
	{ questions, options }
);
