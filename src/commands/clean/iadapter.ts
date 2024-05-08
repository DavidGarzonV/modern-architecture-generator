import { program } from 'commander';
import prompts from 'prompts';

import { EnabledArchitectures } from 'constants/constants';
import { ArchitectureManager } from 'lib/shared/architecture-manager';
import CreateIAdapter from 'lib/clean/iadapter';
import { ContextsManager } from 'lib/shared/contexts-manager';

const questions: prompts.PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'Name of the interface adapter:',
	}
];

export default program
	.createCommand('iadapter')
	.option('-e, --entity <entity>','Name of the entity related to the interface adapter')
	.hook('preAction', () => {
		const result = new ArchitectureManager().validateProjectArchitecture(
			EnabledArchitectures.Clean
		);
		if (!result) {
			throw new Error(
				'Invalid project architecture. This command is only available for Clean Architecture projects.'
			);
		}
	})
	.description('Creates a new interface adapter')
	.action(async (options) => {
		const { name } = await prompts(questions);
		const contextsManager = new ContextsManager();
		const context = await contextsManager.getContextName('interface-adapters');

		try {
			const adapter = new CreateIAdapter();
			await adapter.run({ name, entity: options.entity, contextName: context });
		} catch (error) {
			throw new Error(
				`Error creating interface adapter, ${(error as Error).message}`
			);
		}
	});
