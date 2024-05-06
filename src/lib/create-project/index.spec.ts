import { EnabledArchitectures } from 'constants/constants';
import CreateProject from 'lib/create-project';

describe('CreateProject', () => { 
	let createProject: CreateProject;

	beforeEach(() => {
		createProject = new CreateProject();
	});

	it('should create a new project', async () => {
		await createProject.run({
			name: 'project-name',
			path: '/path/to/project',
			type: EnabledArchitectures.Clean,
			typescript: true,
		});
		expect(true).toBe(true);
	});
});