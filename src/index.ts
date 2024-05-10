import { exec } from 'child_process';
import figlet from 'figlet';
import { program } from 'commander';
import * as dotenv from 'dotenv';

import usecase from 'commands/usecase';
import create from 'commands/create';
import entity from 'commands/entity';
import iadapter from 'commands/clean/iadapter';
import adapter from 'commands/clean/adapter';

dotenv.config();

program
	.name('mag')
	.description('Modern Architecture Generation Tool')
	.version('1.0.0');

program.hook('preAction', () => {
	return new Promise((resolve) => {
		exec('tsc --noEmit', (error) => {
			if (error) {
				throw new Error('The project has incorrect typescript configuration. Please fix it before running the CLI tool.');
			}

			resolve();
		});
	});
});

program.addCommand(create);
program.addCommand(usecase);
program.addCommand(entity);
// Clean
program.addCommand(iadapter);
program.addCommand(adapter);

console.log(
	figlet.textSync('MAG CLI TOOL', {
		horizontalLayout: 'default',
		verticalLayout: 'default',
		whitespaceBreak: true,
	})
);

program.parse();