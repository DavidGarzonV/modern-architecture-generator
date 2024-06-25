import { PromptObject } from 'prompts';
import { CustomCommand } from 'utils/singleton/command';
import { EnabledArchitectures, arquitectureChoices } from 'constants/constants';
import validateDTO from 'validators/validate';
import { ValidatePathDTO } from 'validators/shared/path.dto';
import { ConfigureProject } from 'lib/configure';

const questions: PromptObject[] = [
	{
		type: 'select',
		name: 'type',
		message: 'Pick one architecture',
		choices: arquitectureChoices,
		initial: 0,
	},
	{
		type: 'confirm',
		name: 'createFolderStructure',
		message: 'Create folder structure?',
	}
];

type CommandOptions = {
	path: string;
};

type CommandQuestions = {
	type: EnabledArchitectures;
	createFolderStructure: boolean;
};

export default CustomCommand.createCustomCommand<CommandQuestions,CommandOptions>(
	'configure',
	'Configure MAG in your project',
	async ({ ...response }) => {
		await validateDTO(response, ValidatePathDTO);
		const configureProject = new ConfigureProject();

		try {
			await configureProject.run({
				type: response.type,
				createFolderStructure: response.createFolderStructure
			});

			console.info('MAG configured, enjoy!');
		} catch (error) {
			console.info('An error occurred while configuring the project');

			throw new Error(`${(error as Error).message ?? 'unknown error'}`);
		}
	},
	{ questions }
);
