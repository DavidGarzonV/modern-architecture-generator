import { EnabledArchitectures } from 'constants/constants';
import { getProjectConfiguration } from 'utils/config';

export class ArchitectureManager {
	private _architecture: EnabledArchitectures = EnabledArchitectures.Clean;

	get architecture(): EnabledArchitectures {
		return this._architecture;
	}

	constructor(){
		const config = getProjectConfiguration();
		this._architecture = config.architecture;
	}

	validateProjectArchitecture(architecture: EnabledArchitectures): boolean{
		return architecture === this._architecture;
	}
}