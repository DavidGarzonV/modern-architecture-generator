import { EnabledArchitectures } from 'constants/constants';
import { getConfigVar } from 'utils/config';

export class ArchitectureManager {
	private static _architecture: EnabledArchitectures;

	/**
	 * Sets architecture from the configuration file
	 */
	private static setArchitecture(){
		if (!ArchitectureManager._architecture) {
			ArchitectureManager._architecture = getConfigVar('architecture') as EnabledArchitectures;
		}
	}

	/**
	 * Gets architecture from the configuration file
	 * @returns EnabledArchitectures architecture 
	 */
	public static getArchitecture(): EnabledArchitectures {
		ArchitectureManager.setArchitecture();
		return ArchitectureManager._architecture;
	}

	/**
	 * @description Validate if the project architecture is the same as the command
	 * @param {EnabledArchitectures} architecture
	 * @return {boolean} Architecture is matching
	 */
	public static validateProjectArchitecture(architecture: EnabledArchitectures): boolean{
		ArchitectureManager.setArchitecture();
		return architecture === this._architecture;
	}
}