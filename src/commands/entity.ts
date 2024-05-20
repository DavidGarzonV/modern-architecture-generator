import { program } from 'commander';
import prompts from 'prompts';
import CreateEntity, { Property } from 'lib/entity';
import { ContextsManager } from 'lib/shared/contexts-manager';
import { ValidateNameDTO } from 'validators/shared/name.dto';
import validateDTO from 'validators/validate';

const getEntityProperties = async (addDefaultProperties: boolean): Promise<Property[]> => {
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

	const entityProperties: Property[] = [];
	let askForProperties = addDefaultProperties;

	while (askForProperties) {
		const { addNewProperty, ...rest } = await prompts(propertiesQuestions);	
		entityProperties.push({
			...rest as Property,
		});

		askForProperties = addNewProperty;
	}
	return entityProperties;
};

const questions: prompts.PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'What is the name of the entity?',
	}
];

export default program
	.createCommand('entity')
	.description('Creates a new entity')
	.action(async () => {
		const { name, useContext } = await prompts(questions);

		await validateDTO({ name }, ValidateNameDTO);

		const contextsManager = new ContextsManager();
		const context = await contextsManager.getContextName('entities');

		const { addDefaultProperties } = await prompts([{
			type: 'confirm',
			name: 'addDefaultProperties',
			message: 'Do you want to add properties?',
			initial: true
		}]);

		const entityProperties = await getEntityProperties(addDefaultProperties);
		
		try {
			const createEntity = new CreateEntity();
			await createEntity.run({
				name,
				useContext,
				contextName: context,
				defaultProperties: entityProperties
			});
		} catch (error) {
			console.error('Error creating entity:', (error as Error).message);
		}
	});
