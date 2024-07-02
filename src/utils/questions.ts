import prompts, { PromptObject } from 'prompts';
import { getDirectoryItems } from 'utils/file';

const getDynamicFields = async <Field = object>(
	askForFields: boolean,
	questions: PromptObject[]
): Promise<Field[]> => {
	const entityProperties: Field[] = [];
	let askForMoreFields = askForFields;

	while (askForMoreFields) {
		const { addNewProperty, ...rest } = await prompts(questions);
		entityProperties.push({
			...(rest as Field),
		});

		askForMoreFields = addNewProperty;
	}

	return entityProperties;
};

/**
 * @description Create a loop of questions to ask for dynamic fields
 * @template Field type of the field object asked
 * @param {string} principalQuestion question to ask if the user wants to add fields
 * @param {PromptObject} dynamicQuestions questions to ask in every iteration
 * @return {*} {Promise<Field[]>} array of fields responses
 */
export const asyncAskForDynamicFields = async <Field = object>(
	principalQuestion: string,
	dynamicQuestions: PromptObject[]
): Promise<Field[]> => {
	const { askForFields } = await prompts([
		{
			type: 'confirm',
			name: 'askForFields',
			message: principalQuestion,
			initial: true,
		},
	]);

	return getDynamicFields<Field>(askForFields, dynamicQuestions);
};

/**
 * @description Ask for select an option from a directory files
 * @param {string} question question to ask
 * @param {string} directory directory to search for options
 * @param {string} [filterPath] filter the results by a specific path
 * @return {*}  {(Promise<string | null>)} If not found return null
 */
export const askOptionFromDirectory = async (
	question: string,
	directory: string,
	filterPath?: string
): Promise<string | null> => {
	const items = getDirectoryItems(directory, filterPath);

	if (items.length === 0) {
		return null;
	}

	const choices = items.map((item) => {
		const itemValue = item.split('/').pop()!;
		return { title: itemValue, value: itemValue };
	});

	const { selectedValue } = await prompts([
		{
			type: 'autocomplete',
			name: 'selectedValue',
			message: question,
			choices,
		},
	]);

	return selectedValue;
};
