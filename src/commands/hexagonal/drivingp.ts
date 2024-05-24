import prompts from 'prompts';

import { CreateDrivingPort } from 'lib/hexagonal/drivingp';
import validateDTO from 'validators/validate';
import { ValidateNameDTO } from 'validators/shared/name.dto';
import { EnabledArchitectures } from 'constants/constants';
import { CustomCommand } from 'utils/singleton/command';
import { ContextsManager } from 'utils/singleton/contexts-manager';

const questions: prompts.PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'Name of the driving port:',
	},
];

type CommandQuestions = {
	name: string;
};

export default CustomCommand.createCustomCommand<CommandQuestions>(
	'drivingp',
	'Creates a new driving port',
	async ({ name }) => {
		await validateDTO({ name }, ValidateNameDTO);

		const context = await ContextsManager.getContextName('driving-ports');

		try {
			const adapter = new CreateDrivingPort();
			await adapter.run({ name, contextName: context });
		} catch (error) {
			throw new Error(
				`Error creating driving port, ${(error as Error).message}`
			);
		}
	},
	{
		questions,
		architecture: EnabledArchitectures.Hexagonal,
	}
);