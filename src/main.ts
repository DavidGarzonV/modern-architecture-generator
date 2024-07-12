import { exec } from 'child_process';
import figlet from 'figlet';
import { program } from 'commander';
import * as dotenv from 'dotenv';
import Loader from 'node-cli-loader';

import create from 'commands/create';
import usecase from 'commands/usecase';
import entity from 'commands/entity';
import util from 'commands/util';
import iadapter from 'commands/clean/iadapter';
import adapter from 'commands/clean/adapter';
import drivingp from 'commands/hexagonal/drivingp';
import drivenp from 'commands/hexagonal/drivenp';
import configure from 'commands/configure';

dotenv.config();

export default function main(){
	program
		.name('mag')
		.description('Modern Architecture Generation Tool')
		.version('1.0.0');

	program.hook('preAction', () => {
		return new Promise((resolve) => {
			exec('tsc -v', (error) => {
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
	program.addCommand(configure);
	program.addCommand(util);
	// Clean
	program.addCommand(iadapter);
	program.addCommand(adapter);
	// Hexagonal
	program.addCommand(drivingp);
	program.addCommand(drivenp);

	console.log(
		figlet.textSync('MAG CLI TOOL', {
			horizontalLayout: 'default',
			verticalLayout: 'default',
			whitespaceBreak: true,
		})
	);

	program.parse();

	function handleError(error: Error | unknown | undefined){
		Loader.interrupt();
		if (error && (error as Error).message) {
			console.error('\nApplication error:', (error as Error).message);
		}

		if (process.env.NODE_ENV === 'local' && error) {
			console.error('\nApplication error:', error);
		}

		process.exit(1);
	}

	process.on('unhandledRejection', handleError);
	process.on('uncaughtException', handleError);
}