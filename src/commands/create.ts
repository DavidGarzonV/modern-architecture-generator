import prompts from 'prompts';
import { CommandQuestion, CustomCommand } from 'utils/singleton/command';
import { EnabledArchitectures, arquitectureChoices } from 'constants/constants';
import CreateProject from 'lib/create-project';
import validateDTO from 'validators/validate';
import { ValidatePathDTO } from 'validators/shared/path.dto';
import { ValidateNameDTO } from 'validators/shared/name.dto';
import { openDirectory } from 'utils/file';
import { CommandArgument } from 'utils/singleton/command';
import Loader from 'node-cli-loader';

const questions: CommandQuestion[] = [
	{
		type: 'select',
		name: 'type',
		message: 'Pick one architecture',
		choices: arquitectureChoices,
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
	'Creates a new project with MAG',
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
				Loader.create('Opening folder', { doneMessage: 'Folder opened, enjoy' });
				openDirectory(projectPath);
			} else {
				console.info('Project generated, enjoy!');
			}
		} catch (error) {
			console.info('An error occurred while creating the project');
			createProject.deleteProject();

			throw new Error(`${(error as Error).message ?? 'unknown error'}`);
		}
	},
	{ questions, arguments: commandArguments }
);
