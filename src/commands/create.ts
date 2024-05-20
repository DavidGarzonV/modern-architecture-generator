import { program } from 'commander';
import prompts from 'prompts';
import { exec } from 'child_process';

import { EnabledArchitectures } from 'constants/constants';
import CreateProject from 'lib/create-project';
import validateDTO from 'validators/validate';
import { ValidatePathDTO } from 'validators/shared/path.dto';
import { ValidateNameDTO } from 'validators/shared/name.dto';

type CreateProjectArguments = {
	path?: string;
};

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
	}
];

export default program
	.createCommand('create')
	.description('Creates a new project')
	.argument('<string>', 'Name of the project')
	.option('-p, --path <string>', 'Path to create the project')
	.action(async (name: string, options: CreateProjectArguments) => {
		await validateDTO(options, ValidatePathDTO);

		const response = await prompts(questions);
		const createProject = new CreateProject();

		await validateDTO({ name }, ValidateNameDTO);

		try {
			const projectPath = await createProject.run({
				name,
				path: options.path,
				type: response.type
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
