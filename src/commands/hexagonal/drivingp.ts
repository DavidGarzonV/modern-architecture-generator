import prompts from 'prompts';

import { ContextsManager } from 'lib/shared/contexts-manager';
import { CreateDrivingPort } from 'lib/hexagonal/drivingp';
import validateDTO from 'validators/validate';
import { ValidateNameDTO } from 'validators/shared/name.dto';
import { createCustomCommand } from 'utils/command';
import { EnabledArchitectures } from 'constants/constants';

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

export default createCustomCommand<CommandQuestions>(
	'drivingp',
	'Creates a new driving port',
	async ({ name }) => {
		await validateDTO({ name }, ValidateNameDTO);

		const contextsManager = new ContextsManager();
		const context = await contextsManager.getContextName('driving-ports');

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