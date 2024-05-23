import prompts, { PromptObject } from 'prompts';
import { EnabledArchitectures } from 'constants/constants';
import CreateProject from 'lib/create-project';
import validateDTO from 'validators/validate';
import { ValidatePathDTO } from 'validators/shared/path.dto';
import { ValidateNameDTO } from 'validators/shared/name.dto';
import { CommandArgument, CommandOption, createCustomCommand } from 'utils/command';
import { openDirectory } from 'utils/file';

const questions: PromptObject[] = [
	{
		type: 'select',
		name: 'type',
		message: 'Pick one architecture',
		choices: [
			{ title: 'Clean Architecture', value: EnabledArchitectures.Clean },
			{
				title: 'Hexagonal Architecture',
				value: EnabledArchitectures.Hexagonal,
			},
		],
		initial: 0,
	},
];

const options: CommandOption[] = [
	{
		command: '-p, --path <string>',
		description: 'Path to create the project',
	},
];

const commandArguments: CommandArgument[] = [
	{
		type: 'string',
		description: 'Name of the project'
	}
];

type CommandOptions = {
	path: string;
};

type CommandQuestions = {
	type: EnabledArchitectures;
};

type CommandArguments = { name: string };

export default createCustomCommand<CommandQuestions,CommandOptions,CommandArguments>(
	'create',
	'Creates a new project',
	async ({ name, ...response }) => {
		await validateDTO(response, ValidatePathDTO);
		const createProject = new CreateProject();

		await validateDTO({ name }, ValidateNameDTO);

		try {
			const projectPath = await createProject.run({
				name,
				path: response.path,
				type: response.type,
			});

			console.info(`Project created at ${projectPath}.`);

			const { openFolder } = await prompts([
				{
					type: 'confirm',
					name: 'openFolder',
					message: 'Do you want to open the project folder?',
				},
			]);

			if (openFolder) {
				console.info('Opening folder...');
				openDirectory(projectPath);
			} else {
				console.info('Project generated, enjoy!');
			}
		} catch (error) {
			console.error(`Error creating project, ${(error as Error).message}`);
		}
	},
	{ questions, options, arguments: commandArguments }
);
