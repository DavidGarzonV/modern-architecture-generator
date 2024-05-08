import { program } from 'commander';
import CreateEntity from 'lib/entity';
import { ProjectStructure } from 'lib/shared/project-structure';
import prompts from 'prompts';
import { Property } from 'types/entity';
import { pathExists, readDirectory } from 'utils/file';

const getContexts = async (): Promise<prompts.Choice[]> => {
	const projectStructure = new ProjectStructure();
	const useCasesFolder = projectStructure.findFolderPathByName('entities');
	const contexts: prompts.Choice[] = [];

	if (pathExists(useCasesFolder)) {
		const folders = readDirectory(useCasesFolder);
		folders.forEach((folder) => {
			const contents = readDirectory(`${useCasesFolder}/${folder}`);
			const hasFiles = contents.some((content) => content.includes('.'));
			if (!hasFiles) {
				contexts.push({ title: folder, value: folder });
			}
		});
	}

	return contexts;
};

const getContextName = async (useContext: boolean): Promise<string | undefined> => {
	let context = undefined;
	if (useContext) {
		const currentContexts = await getContexts();
		let contextQuestion: prompts.PromptObject | undefined;

		if (currentContexts.length > 0) {
			contextQuestion = {
				type: 'select',
				name: 'contextName',
				message: 'Select the context:',
				choices: currentContexts,
			};
		} else {
			contextQuestion = {
				type: 'text',
				name: 'contextName',
				message: 'What is the context name?',
			};
		}

		const { contextName } = await prompts([contextQuestion]);
		context = contextName;
	}

	return context;
};

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
	},
	{
		type: 'toggle',
		name: 'useContext',
		message: 'The entity belongs to a context?',
		initial: false,
		active: 'yes',
		inactive: 'no',
	}
];

export default program
	.createCommand('entity')
	.description('Creates a new entity')
	.action(async () => {
		const { name, useContext } = await prompts(questions);

		const context = await getContextName(useContext);

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
