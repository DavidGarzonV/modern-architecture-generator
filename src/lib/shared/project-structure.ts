import { EnabledArchitectures } from 'constants/constants';
import { FolderStructure } from 'constants/types';
import fs from 'fs';

export class ProjectStructure {
	projectStructure: FolderStructure = [];
	
	setProjectStructure(architecture: EnabledArchitectures): FolderStructure{
		const projectPath = process.cwd();
		const jsonFile = fs.readFileSync(`${projectPath}/src/templates/folder-structure/${architecture}.json`, 'utf-8');

		const structure = JSON.parse(jsonFile) as FolderStructure;
		this.projectStructure = structure;
		return structure;
	}
}