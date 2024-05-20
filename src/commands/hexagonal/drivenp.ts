import { program } from 'commander';
import prompts from 'prompts';

import { EnabledArchitectures } from 'constants/constants';
import { ArchitectureManager } from 'lib/shared/architecture-manager';
import { ContextsManager } from 'lib/shared/contexts-manager';
import { CreateDrivenPort } from 'lib/hexagonal/drivenp';
import validateDTO from 'validators/validate';
import { ValidateEntityDTO } from 'validators/shared/entity.dto';
import { ValidateNameDTO } from 'validators/shared/name.dto';

const questions: prompts.PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'Name of the driven port:',
	}
];

export default program
	.createCommand('drivenp')
	.option('-e, --entity <entity>','Name of the entity related to the driven port')
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
	.description('Creates a new driven port')
	.action(async (options) => {
		await validateDTO(options, ValidateEntityDTO);

		const { name } = await prompts(questions);
		await validateDTO({ name }, ValidateNameDTO);

		const contextsManager = new ContextsManager();
		const context = await contextsManager.getContextName('driven-ports');

		try {
			const adapter = new CreateDrivenPort();
			await adapter.run({ name, entity: options.entity, contextName: context });
		} catch (error) {
			throw new Error(
				`Error creating driven port, ${(error as Error).message}`
			);
		}
	});
