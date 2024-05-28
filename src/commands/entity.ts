import { PromptObject } from 'prompts';
import CreateEntity, { Property } from 'lib/entity';
import { ValidateNameDTO } from 'validators/shared/name.dto';
import validateDTO from 'validators/validate';
import { asyncaskForDynamicFields } from 'utils/questions';
import { CustomCommand } from 'utils/singleton/command';
import { ContextsManager } from 'utils/singleton/contexts-manager';

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

export default CustomCommand.createCustomCommand<CommandQuestions>(
	'entity',
	'Creates a new entity',
	async ({ name }) => {
		await validateDTO({ name }, ValidateNameDTO);

		const context = await ContextsManager.getContextName('entities', true);

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
