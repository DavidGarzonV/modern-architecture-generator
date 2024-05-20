import { EnabledArchitectures } from 'constants/constants';
import { getConfigVar } from 'utils/config';

export class ArchitectureManager {
	private _architecture: EnabledArchitectures = EnabledArchitectures.Clean;

	get architecture(): EnabledArchitectures {
		return this._architecture;
	}

	constructor(){
		this._architecture = getConfigVar('architecture') as EnabledArchitectures;
	}

	/**
	 * @description Validate if the project architecture is the same as the command
	 * @param {EnabledArchitectures} architecture
	 * @return {*}  {boolean}
	 * @memberof ArchitectureManager
	 */
	validateProjectArchitecture(architecture: EnabledArchitectures): boolean{
		return architecture === this._architecture;
	}
}