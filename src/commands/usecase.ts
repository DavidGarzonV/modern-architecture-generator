import { program } from 'commander';
import prompts from 'prompts';
import { ContextsManager } from 'lib/shared/contexts-manager';
import CreateUseCase from 'lib/usecase';

const questions: prompts.PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'What is the name of the use case?',
	}
];

export default program
	.createCommand('usecase')
	.description('Creates a new use case')
	.option('-t, --tests', 'Create tests file')
	.action(async (options) => {
		const { name, useContext } = await prompts(questions);

		const contextsManager = new ContextsManager();
		const context = await contextsManager.getContextName('use-cases');

		try {
			const createUseCase = new CreateUseCase();
			await createUseCase.run({
				name,
				useContext,
				contextName: context,
				createTests: options.tests,
			});
		} catch (error) {
			console.error('Error creating use case:', (error as Error).message);
		}
	});
