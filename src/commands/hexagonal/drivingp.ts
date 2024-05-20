import { program } from 'commander';
import prompts from 'prompts';

import { EnabledArchitectures } from 'constants/constants';
import { ArchitectureManager } from 'lib/shared/architecture-manager';
import { ContextsManager } from 'lib/shared/contexts-manager';
import { CreateDrivingPort } from 'lib/hexagonal/drivingp';

const questions: prompts.PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'Name of the driving port:',
	}
];

export default program
	.createCommand('drivingp')
	.hook('preAction', () => {
		const result = new ArchitectureManager().validateProjectArchitecture(
			EnabledArchitectures.Hexagonal
		);
		if (!result) {
			throw new Error(
				'Invalid project architecture. This command is only available for hexagonal architecture projects'
			);
		}
	})
	.description('Creates a new driving port')
	.action(async () => {
		const { name } = await prompts(questions);
		const contextsManager = new ContextsManager();
		const context = await contextsManager.getContextName('driving-ports');

		try {
			const adapter = new CreateDrivingPort();
			await adapter.run({ name, contextName: context });
		} catch (error) {
			throw new Error(
				`Error creating driven port, ${(error as Error).message}`
			);
		}
	});
