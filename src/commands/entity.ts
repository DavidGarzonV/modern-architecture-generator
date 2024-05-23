import { PromptObject } from 'prompts';
import CreateEntity, { Property } from 'lib/entity';
import { ContextsManager } from 'lib/shared/contexts-manager';
import { ValidateNameDTO } from 'validators/shared/name.dto';
import validateDTO from 'validators/validate';
import { createCustomCommand } from 'utils/command';
import { asyncaskForDynamicFields } from 'utils/questions';

const dynamicQuestions: PromptObject[] = [
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

const questions: PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'What is the name of the entity?',
	}
];

type CommandQuestions = {
	name: string;
};

export default createCustomCommand<CommandQuestions>(
	'entity',
	'Creates a new entity',
	async ({ name }) => {
		await validateDTO({ name }, ValidateNameDTO);

		const contextsManager = new ContextsManager();
		const context = await contextsManager.getContextName('entities');

		const entityProperties = await asyncaskForDynamicFields<Property>('Do you want to add properties?', dynamicQuestions);

		try {
			const createEntity = new CreateEntity();
			await createEntity.run({
				name,
				contextName: context,
				defaultProperties: entityProperties
			});
		} catch (error) {
			console.error('Error creating entity:', (error as Error).message);
		}
	},
	{ questions }
);
