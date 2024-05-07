import { program } from 'commander';
import CreateUseCase from 'lib/usecase';
import prompts from 'prompts';

const questions: prompts.PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'What is the name of the use case?'
	},
	{
		type: 'toggle',
		name: 'useContext',
		message: 'The use case belongs to a context?',
		initial: false,
		active: 'yes',
		inactive: 'no',
	},
	{
		type: prev => prev ? 'text' : null,
		name: 'contextName',
		message: 'What is the context name?',
	}
];

export default program
	.createCommand('usecase')
	.description('Creates a new use case')
	.option('-t, --tests', 'Create tests file')
	.action(async (options) => {
		const { name, useContext, contextName } = await prompts(questions);
		const createUseCase = new CreateUseCase();

		try {
			await createUseCase.run({
				name,
				useContext,
				contextName,
				createTests: options.tests,
			});
		} catch (error) {
			console.error('Error creating use case:', (error as Error).message);
		}
	});