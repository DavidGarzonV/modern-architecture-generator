import { Command, program } from 'commander';
import { EnabledArchitectures } from 'constants/constants';
import { ArchitectureManager } from 'lib/shared/architecture-manager';
import prompts from 'prompts';

type CommandAdditionalOptions = {
	options?: CommandOption[],
	arguments?: CommandArgument[],
	questions?: prompts.PromptObject[],
	architecture?: EnabledArchitectures;
	hooks?: {
		preAction?: (thisCommand: Command, actionCommand: Command) => void | Promise<void>;
	}
}

export type CommandOption = {
	command: string;
	description: string;
};

export type CommandArgument = {
	type: string;
	description: string;
};

export type CommandAction<T> = (options: T) => void | Promise<void>;

/**
 * Creates command
 * @template CommandQuestions command response questions properties object
 * @template CommandOptions command response options properties object
 * @template CommandArguments command arguments options given in command line
 * @param commandName short and long name of the command (e.g. '-n, --name')
 * @param description command description
 * @param action callback function to execute when the command is called with the values (arguments, options, questions)
 * @param [CommandAdditionalOptions] Command additional options (e.g. hooks, questions, options, architecture)
 * @param [CommandAdditionalOptions.options] command options
 * @param [CommandAdditionalOptions.questions] command questions
 * @param [CommandAdditionalOptions.arguments] command arguments
 * @param [CommandAdditionalOptions.architecture] command architecture enabled to run the command
 * @param [CommandAdditionalOptions.hooks] command hooks
 * @param [CommandAdditionalOptions.hooks.preAction] pre action hook
 * @returns Command instance
 */
export function createCustomCommand<CommandQuestions = object, CommandOptions = unknown, CommandArguments = unknown>(
	commandName: string,
	description: string,
	action: CommandAction<CommandArguments & Partial<CommandOptions> & CommandQuestions>,
	commandOptions?: CommandAdditionalOptions
) {
	const command = program.createCommand(commandName).description(description);

	if (commandOptions) {
		const { questions, arguments: commandArguments, options, hooks, architecture } = commandOptions;

		if (options) {
			options.forEach((option) => {
				command.option(option.command, option.description);
			});
		}

		if (commandArguments) {
			commandArguments.forEach((argument) => {
				command.argument(`<${argument.type}>`, argument.description);
			});
		}

		if (hooks?.preAction) {
			command.hook('preAction', hooks.preAction);
		}

		if (architecture) {
			const result = new ArchitectureManager().validateProjectArchitecture(
				architecture
			);
			if (!result) {
				throw new Error(
					`Invalid project architecture. This command is only available for projects with ${architecture} architecture`
				);
			}
		}

		return command.action(async (options) => {
			let commandOptions = options;
			if (questions) {
				const answers = await prompts(questions);
				commandOptions = { ...options, ...answers };
			}
	
			await action(commandOptions);
		});
	}

	return command.action(async (options) => {
		await action(options);
	});
}
