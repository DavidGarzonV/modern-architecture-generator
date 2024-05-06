import { program } from 'commander';
import prompts from 'prompts';
import { exec } from 'child_process';

import { EnabledArchitectures } from 'constants/constants';
import CreateProject from 'lib/create-project';
import { CreateProjectArguments } from 'types/create';

const questions: prompts.PromptObject[] = [
	{
		type: 'select',
		name: 'type',
		message: 'Pick one architecture',
		choices: [
			{ title: 'Clean Architecture', value: EnabledArchitectures.Clean },
			{ title: 'Hexagonal Architecture', value: EnabledArchitectures.Hexagonal }
		],
		initial: 0,
	},
	{
		type: 'toggle',
		name: 'typescript',
		message: 'Use Typescript?',
		initial: true,
		active: 'yes',
		inactive: 'no',
	},
];

export default program
	.createCommand('create')
	.description('Creates a new project')
	.argument('<string>', 'Name of the project')
	.option('-p, --path <string>', 'Path to create the project')
	.action(async (name: string, options: CreateProjectArguments) => {
		const response = await prompts(questions);
		const createProject = new CreateProject();

		try {
			const projectPath = await createProject.run({
				name,
				path: options.path,
				type: response.type,
				typescript: response.typescript,
			});
	
			console.info(`Project created at ${projectPath}.`);

			const { openFolder } = await prompts([
				{
					type: 'confirm',
					name: 'openFolder',
					message: 'Do you want to open the project folder?',
				}
			]);

			if (openFolder) {
				console.info('Opening folder...');

				exec(`start "" ${projectPath}`, () => {
					console.info('Folder opened, enjoy!');
				});
			}else{
				console.info('Project generated, enjoy!');
			}
		} catch (error) {
			console.error(`Error creating project, ${(error as Error).message}`);
		}
	});
