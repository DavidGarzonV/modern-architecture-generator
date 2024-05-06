export enum EnabledArchitectures{
	Clean = 'clean',
	Hexagonal = 'hexagonal'
}

export const ARCHITECTURE_KEYWORDS = {
	[EnabledArchitectures.Clean]: ['architecture', 'clean-architecture', 'nodejs'],
	[EnabledArchitectures.Hexagonal]: ['architecture', 'hexagonal-architecture', 'nodejs'],
};

export const README_PATH = 'src/templates/readme';
export const README_PUBLIC_PATH = `${README_PATH}/public`;
