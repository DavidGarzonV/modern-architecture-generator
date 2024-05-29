import prompts, { PromptObject } from 'prompts';
import { CustomCommand } from 'utils/singleton/command';
import { EnabledArchitectures } from 'constants/constants';
import CreateProject from 'lib/create-project';
import validateDTO from 'validators/validate';
import { ValidatePathDTO } from 'validators/shared/path.dto';
import { ValidateNameDTO } from 'validators/shared/name.dto';
import { openDirectory } from 'utils/file';
import { CommandArgument } from 'utils/singleton/command';

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

const commandArguments: CommandArgument[] = [
	{
		type: 'string',
		value: 'name',
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

export default CustomCommand.createCustomCommand<CommandQuestions,CommandOptions,CommandArguments>(
	'create',
	'Creates a new project',
	async ({ name, ...response }) => {
		await validateDTO(response, ValidatePathDTO);
		const createProject = new CreateProject();

		await validateDTO({ name }, ValidateNameDTO);
		let projectPath = '';

		try {
			projectPath = await createProject.run({
				name,
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
			console.error(`Error creating project, ${(error as Error).message ?? 'unknown error'}`);

			if (projectPath) {
				createProject.deleteProject(projectPath);
			}
		}
	},
	{ questions, arguments: commandArguments }
);
