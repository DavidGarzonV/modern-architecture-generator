import { program } from 'commander';
import { ProjectStructure } from 'lib/shared/project-structure';
import CreateUseCase from 'lib/usecase';
import prompts from 'prompts';
import { pathExists, readDirectory } from 'utils/file';

const getContexts = async (): Promise<prompts.Choice[]> => {
	const projectStructure = new ProjectStructure();
	const useCasesFolder = projectStructure.findFolderPathByName('use-cases');
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

const questions: prompts.PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'What is the name of the use case?',
	},
	{
		type: 'toggle',
		name: 'useContext',
		message: 'The use case belongs to a context?',
		initial: false,
		active: 'yes',
		inactive: 'no',
	},
];

export default program
	.createCommand('usecase')
	.description('Creates a new use case')
	.option('-t, --tests', 'Create tests file')
	.action(async (options) => {
		const { name, useContext } = await prompts(questions);

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
