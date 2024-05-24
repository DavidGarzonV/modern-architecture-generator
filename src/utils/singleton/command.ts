import { Command } from 'commander';
import { EnabledArchitectures } from 'constants/constants';
import prompts, { PromptObject } from 'prompts';
import { ArchitectureManager } from 'utils/singleton/architecture-manager';
import { Configuration } from 'utils/singleton/configuration';


type CommandAdditionalOptions = {
	options?: CommandOption[],
	arguments?: CommandArgument[],
	questions?: PromptObject[],
	architecture?: EnabledArchitectures;
	hooks?: {
		preAction?: (thisCommand: Command, actionCommand: Command) => void | Promise<void>;
	}
}

type DefaultCommandOptions = {
	path: string;
}

type CommandOptions<T> = T & DefaultCommandOptions;

export type CommandOption = {
	command: string;
	value: string;
	description: string;
};

export type CommandArgument = {
	type: string;
	value: string;
	description: string;
};

export type CommandAction<T> = (options: T) => void | Promise<void>;
export type CommandActionResponse<Arguments, Options, Questions> = Arguments & Partial<Options> & Questions


export class CustomCommand {
	private static defaultCommandOptions: CommandOption[] = [
		{
			command: '-p, --path <string>',
			description: 'Path to create the project',
			value: 'path',
		},
	];
	private static _executionPath: string = process.cwd();

	public static getExecutionPath(): string {
		return CustomCommand._executionPath;
	}

	public static setExecutionPath(path: string): void {
		CustomCommand._executionPath = path;
	}

	/**
	 * Handles command options, setting the path if it is present and returning the command options
	 * @template Options 
	 * @param options Command options
	 * @param responseOptions Options given in the command line
	 * @returns  
	 */
	private static handleCommandOptions<Options>(options: CommandOption[], responseOptions: object){
		if (Object.keys(responseOptions).length === 0) {
			return {};
		}

		const commandOptions: Partial<CommandOptions<Options>> = {};
		options.forEach((option) => {
			const optionName = option.value;
			const responseValue = responseOptions[optionName as keyof typeof responseOptions];
			if (responseValue) {
				commandOptions[optionName as keyof typeof commandOptions] = responseValue;
			}
		});

		if (commandOptions.path) {
			CustomCommand.setExecutionPath(commandOptions.path);
		}

		return commandOptions;
	}

	/**
	 * Validates configuration after setting the command options
	 * @param commandName Command executed
	 */
	private static validateConfiguration(commandName: string){
		if (commandName !== 'create') {			
			Configuration.validateMagAndConfig();
		}
	}

	/**
	 * Creates command
	 * @template Questions command response questions properties object
	 * @template Options command response options properties object
	 * @template Arguments command arguments options given in command line
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
	public static createCustomCommand<Questions = object, Options = unknown, Arguments = unknown>(
		commandName: string,
		description: string,
		action: CommandAction<CommandActionResponse<Arguments, CommandOptions<Options>, Questions>>,
		commandOptions?: CommandAdditionalOptions
	) {
		type ResponseType = CommandActionResponse<Arguments, CommandOptions<Options>, Questions>
		const command = new Command(commandName).description(description);

		const options = [ ...(commandOptions?.options ?? []), ...CustomCommand.defaultCommandOptions];
	
		if (options) {
			options.forEach((option) => {
				command.option(option.command, option.description);
			});
		}

		if (commandOptions) {
			const { questions, arguments: commandArguments, hooks, architecture } = commandOptions;
	
			if (commandArguments) {
				commandArguments.forEach((argument) => {
					command.argument(`<${argument.type}>`, argument.description);
				});
			}
	
			if (hooks?.preAction) {
				command.hook('preAction', hooks.preAction);
			}
	
			if (architecture) {
				command.hook('preAction', async () => {
					const result = ArchitectureManager.validateProjectArchitecture(
						architecture
					);
					if (!result) {
						throw new Error(
							`Invalid project architecture. This command is only available for projects with ${architecture} architecture`
						);
					}
				});
			}
	
			return command.action(async (...response) => {
				const responseArguments: Partial<Arguments> = {};
				let responseIndex = 0;
				if (commandArguments) {
					commandArguments.forEach((argument, index: number) => {
						responseArguments[argument.value as keyof typeof responseArguments] = response[index];
					});
					responseIndex = commandArguments.length;
				}

				const commandOptions = CustomCommand.handleCommandOptions<Options>(options, response[responseIndex]);
				CustomCommand.validateConfiguration(commandName);

				if (questions) {
					const answers = await prompts(questions);
					await action({ ...responseArguments, ...commandOptions, ...answers } as ResponseType);
				}else{
					await action({ ...responseArguments, ...commandOptions } as ResponseType);
				}
			});
		}
	
		return command.action(async (response) => {
			const commandOptions = CustomCommand.handleCommandOptions<Options>(options, response);
			CustomCommand.validateConfiguration(commandName);
			await action(commandOptions as ResponseType);
		});
	}
}