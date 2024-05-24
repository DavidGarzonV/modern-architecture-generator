import { PromptObject } from 'prompts';
import { EnabledArchitectures } from 'constants/constants';
import { CreateDrivenPort } from 'lib/hexagonal/drivenp';
import validateDTO from 'validators/validate';
import { ValidateEntityDTO } from 'validators/shared/entity.dto';
import { ValidateNameDTO } from 'validators/shared/name.dto';
import { CommandOption, CustomCommand } from 'utils/singleton/command';
import { ContextsManager } from 'utils/singleton/contexts-manager';

const questions: PromptObject[] = [
	{
		type: 'text',
		name: 'name',
		message: 'Name of the driven port:',
	}
];

const options: CommandOption[] = [{
	command: '-e, --entity <entity>',
	description: 'Name of the entity related to the driven port',
	value: 'entity',
}];

type CommandQuestions = {
	name: string;
};

type CommandOptions = {
	entity?: string;
}

export default CustomCommand.createCustomCommand<CommandQuestions, CommandOptions>(
	'drivenp',
	'Creates a new driven port',
	async ({ name , entity }) => {
		await validateDTO({ entity }, ValidateEntityDTO);
		await validateDTO({ name }, ValidateNameDTO);

		const context = await ContextsManager.getContextName('driven-ports');

		try {
			const adapter = new CreateDrivenPort();
			await adapter.run({ name, entity, contextName: context });
		} catch (error) {
			throw new Error(
				`Error creating driven port, ${(error as Error).message}`
			);
		}
	},
	{
		questions,
		options,
		architecture: EnabledArchitectures.Hexagonal,
	}
);