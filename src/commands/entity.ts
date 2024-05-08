import { program } from 'commander';
import CreateEntity from 'lib/entity';
import prompts from 'prompts';

// TODO - Add default properties
const questions: prompts.PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'What is the name of the entity?'
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
	.createCommand('entity')
	.description('Creates a new entity')
	.action(async () => {
		const { name, useContext, contextName } = await prompts(questions);
		const createEntity = new CreateEntity();

		try {
			await createEntity.run({
				name,
				useContext, 
				contextName
			});
		} catch (error) {
			console.error('Error creating entity:', (error as Error).message);
		}
	});