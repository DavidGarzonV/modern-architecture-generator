import { EnabledArchitectures } from 'constants/constants';

export type CreateProjectArguments = {
	path?: string;
};

export type CreateProjectOptions = CreateProjectArguments & {
	name: string;
	type: EnabledArchitectures;
	typescript: boolean;
};
