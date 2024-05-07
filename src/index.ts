import figlet from 'figlet';
import { program } from 'commander';
import usecase from 'commands/usecase';
import create from 'commands/create';

program
	.name('mag')
	.description('Modern Architecture Generation Tool')
	.version('1.0.0');

program.addCommand(create);
program.addCommand(usecase);

console.log(
	figlet.textSync('MAG CLI TOOL', {
		horizontalLayout: 'default',
		verticalLayout: 'default',
		whitespaceBreak: true,
	})
);

program.parse();