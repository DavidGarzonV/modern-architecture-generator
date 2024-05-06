import figlet from 'figlet';
import { program } from 'commander';
import create from 'commands/create';

program
	.name('mag')
	.description('Modern Architecture Generation Tool')
	.version('1.0.0');

program.addCommand(create);

console.log(
	figlet.textSync('MAG TOOL', {
		horizontalLayout: 'default',
		verticalLayout: 'default',
		whitespaceBreak: true,
	})
);

program.parse();