import { PromptObject } from 'prompts';
import { ContextsManager } from 'lib/shared/contexts-manager';
import CreateUseCase from 'lib/usecase';
import validateDTO from 'validators/validate';
import { UseCaseDTO } from 'validators/usecase.dto';
import { CommandOption, createCustomCommand } from 'utils/command';

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
	},
];

type CommandOptions = {
	tests: boolean;
};

type CommandQuestions = {
	name: string;
};

export default createCustomCommand<CommandQuestions, CommandOptions>(
	'usecase',
	'Creates a new use case',
	async (response) => {
		await validateDTO(response, UseCaseDTO);
		const { name } = response;

		const contextsManager = new ContextsManager();
		const context = await contextsManager.getContextName('use-cases');

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
