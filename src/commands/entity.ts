import { PromptObject } from 'prompts';
import CreateEntity from 'lib/entity';
import { ValidateNameDTO } from 'validators/shared/name.dto';
import validateDTO from 'validators/validate';
import { asyncAskForDynamicFields } from 'utils/questions';
import { CommandArgument, CommandQuestion, CustomCommand } from 'utils/singleton/command';
import { ContextsManager } from 'utils/singleton/contexts-manager';
import { ClassProperty } from 'constants/types';

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

const questions: CommandQuestion[] = [
	{
		type: 'select',
		name: 'useClass',
		message: 'Use an interface or a class?',
		choices: [
			{ title: 'Interface', value: false },
			{ title: 'Class', value: true },
		],
		initial: 0
	},
	{
		type: 'confirm',
		name: 'settersAndGetters',
		message: 'Do you want to create getters and setters?',
		conditional: 'useClass',
	}
];

const commandArguments: CommandArgument[] = [
	{
		type: 'text',
		value: 'name',
		description: 'What is the name of the entity?',
	}
];

type CommandArguments = {
	name: string;
};

type CommandQuestions = {
	useClass: boolean;
	settersAndGetters?: boolean;
};

export default CustomCommand.createCustomCommand<CommandQuestions, unknown, CommandArguments>(
	'entity',
	'Creates a new entity',
	async ({ name, useClass, settersAndGetters }) => {
		await validateDTO({ name }, ValidateNameDTO);

		const context = await ContextsManager.getContextName('entities', true);

		const entityProperties = await asyncAskForDynamicFields<ClassProperty>(
			'Do you want to add properties?', dynamicQuestions
		);

		try {
			const createEntity = new CreateEntity();
			await createEntity.run({
				name,
				contextName: context,
				defaultProperties: entityProperties,
				useClass,
				settersAndGetters,
			});
		} catch (error) {
			throw new Error(`Error creating entity: ${(error as Error).message}`);
		}
	},
	{ arguments: commandArguments, questions }
);
