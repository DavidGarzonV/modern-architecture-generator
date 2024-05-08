import { program } from 'commander';
import CreateEntity from 'lib/entity';
import prompts from 'prompts';
import { Property } from 'types/entity';

const propertiesQuestions: prompts.PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'What is the property name?',
	},
	{
		type: 'autocomplete',
		name: 'type',
		message: 'What is the property type?',
		choices: [
			{ title: 'String', value: 'string' },
			{ title: 'Number', value: 'number' },
			{ title: 'Boolean', value: 'boolean' },
			{ title: 'Date', value: 'Date' },
		],
	},
	{
		type: 'confirm',
		name: 'addNewProperty',
		message: 'Do you want to add another property?',
		initial: true,
	},
];

const questions: prompts.PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'What is the name of the entity?',
	},
	{
		type: 'toggle',
		name: 'useContext',
		message: 'The entity belongs to a context?',
		initial: false,
		active: 'yes',
		inactive: 'no',
	},
	{
		type: (prev) => (prev ? 'text' : null),
		name: 'contextName',
		message: 'What is the context name?',
	},
	{
		type: 'confirm',
		name: 'addDefaultProperties',
		message: 'Do you want to add properties?',
		initial: true
	}
];

export default program
	.createCommand('entity')
	.description('Creates a new entity')
	.action(async () => {
		const { name, useContext, contextName, addDefaultProperties } = await prompts(questions);

		let askForProperties = addDefaultProperties;
		const entityProperties: Property[] = [];

		while (askForProperties) {
			const { addNewProperty, ...rest } = await prompts(propertiesQuestions);	
			entityProperties.push({
				...rest as Property,
			});

			askForProperties = addNewProperty;
		}

		const createEntity = new CreateEntity();

		try {
			await createEntity.run({
				name,
				useContext,
				contextName,
				defaultProperties: entityProperties
			});
		} catch (error) {
			console.error('Error creating entity:', (error as Error).message);
		}
	});
