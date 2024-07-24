import { CommandQuestion, CustomCommand } from 'utils/singleton/command';
import { EnabledArchitectures, arquitectureChoices, unitTestingFrameworkChoices } from 'constants/constants';
import validateDTO from 'validators/validate';
import { ValidatePathDTO } from 'validators/shared/path.dto';
import { ConfigureProject } from 'lib/configure';

const questions: CommandQuestion[] = [
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
	},
	{
		type: 'confirm',
		name: 'configureTestFramework',
		message: 'Configure testing framework?',
	},
	{
		type: prev => prev ? 'select' : null,
		name: 'testingFramework',
		message: 'Pick one framework',
		choices: unitTestingFrameworkChoices,
		initial: 0,
	}
];

type CommandOptions = {
	path: string;
};

type CommandQuestions = {
	type: EnabledArchitectures;
	createFolderStructure: boolean;
	testingFramework?: string;
};

export default CustomCommand.createCustomCommand<CommandQuestions,CommandOptions>(
	'configure',
	'Configure MAG in your existing project',
	async ({ ...response }) => {
		await validateDTO(response, ValidatePathDTO);
		const configureProject = new ConfigureProject();

		try {
			await configureProject.run({
				type: response.type,
				createFolderStructure: response.createFolderStructure,
				testingFramework: response.testingFramework,
			});

			console.info('MAG configured, enjoy!');
		} catch (error) {
			console.info('An error occurred while configuring the project');

			throw new Error(`${(error as Error).message ?? 'unknown error'}`);
		}
	},
	{ questions }
);
