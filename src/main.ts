import { exec } from 'child_process';
import figlet from 'figlet';
import { program } from 'commander';
import * as dotenv from 'dotenv';
import { readdirSync } from 'fs';
import { join } from 'path';
import Loader from 'node-cli-loader';
import rl from 'readline';
import kleur from 'kleur';
import { icons } from 'constants/constants';

dotenv.config();

export default function main(){
	program
		.name('mag')
		.description('Modern Architecture Generation Tool')
		.version('1.0.0');

	program.hook('preAction', () => {
		return new Promise((resolve) => {
			exec('npm run build -v', (error) => {
				if (error) {
					throw new Error('The project has incorrect typescript configuration. Please fix it before running the CLI tool.');
				}

				resolve();
			});
		});
	});

	const filterFiles = (file: string) => file.endsWith('.js') && !file.includes('.test.js');
	const commandsFolderPath = join(__dirname, 'commands');
	const commandFiles = readdirSync(commandsFolderPath).filter(filterFiles).map((file) => join(commandsFolderPath, file));
	const commandArchitectureFiles = readdirSync(commandsFolderPath)
		.filter((file) => !file.includes('.'))
		.reduce((acc, file) => {
			return [...acc, ...readdirSync(join(commandsFolderPath, file)).filter(filterFiles).map((f) => join(join(commandsFolderPath, file), f))];
		}, [] as string[]);

	commandFiles.concat(commandArchitectureFiles).forEach((file) => {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const command = require(file).default;
		program.addCommand(command);
	});

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
			console.error(kleur.red(icons.cross) + ' ' +(error as Error).message);
		}

		if (process.env.NODE_ENV === 'local' && error) {
			console.error(kleur.red(icons.cross) + ' '+ 'Application error:', error);
		}

		process.exit(1);
	}

	process.on('unhandledRejection', handleError);
	process.on('uncaughtException', handleError);

	if (process.platform === 'win32') {
		rl.createInterface({
			input: process.stdin,
			output: process.stdout,
		}).on('SIGINT', function () {
			process.emit('SIGINT');
		});
	}

	process.on('SIGINT', function () {
		console.info('\n' + kleur.red(icons.cross) + '  '+ 'MAG CLI tool has been stopped.');
		process.exit();
	});
}