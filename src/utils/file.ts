import { exec } from 'child_process';
import fs from 'fs';
import { getConfigVar } from 'utils/config';

export const createDirectory = (path: string): string => {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}

	return path;
};

export const deleteFolder = (path: string, recursive: boolean = true): void => {
	if (fs.existsSync(path)) {
		fs.rmSync(path, { recursive });
	}
};

export const copyFile = (source: string, destination: string): void => {
	fs.copyFileSync(source, destination);
};

export const readDirectory = (path: string): string[] => {
	if (fs.existsSync(path)) {
		return fs.readdirSync(path);
	}
	return [];
};

export const pathExists = (path: string): boolean => {
	return fs.existsSync(path);
};

export const readFile = (path: string, encoding: BufferEncoding = 'utf-8'): string => {
	return fs.readFileSync(path, encoding);
};

export const writeFile = (path: string, data: string, encoding: BufferEncoding = 'utf-8'): void => {
	const filesEol = getConfigVar('filesEOL');
	if (filesEol === 'CRLF') {
		data = data.replace(/\n/g, '\r\n');
	}
	fs.writeFileSync(path, data, encoding);
};

export const validatePath = (path: string): void => {
	try {
		fs.accessSync(path, fs.constants.F_OK);
	} catch (error) {
		throw new Error('Invalid path');
	}
};

export const openDirectory = (path: string): void => {
	exec(`start "" ${path}`, (error) => {
		if (error) {
			throw new Error(`Error opening folder ${path}`);
		}
		console.info('Folder opened, enjoy!');
	});
};

export const isDirectory = (path: string): boolean => {
	return fs.statSync(path).isDirectory();
};

export const getDirectoryItems = (directory: string, filterPath?: string) => {
	if (!isDirectory(directory)) {
		return [];
	}

	const ignoredFolders = ['.git', 'node_modules', 'dist', 'build', 'coverage', 'test', 'tests', 'temp', 'tmp'];

	const currentItems = readDirectory(directory);
	let filteredItems: string[] = [];

	currentItems.forEach((item) => {
		if (filterPath) {
			if (item.includes(filterPath)) {
				const fileName = item.replace(filterPath, '');
				filteredItems.push(fileName);
			}
		}else{
			filteredItems.push(item);
		}

		if (!ignoredFolders.includes(item)) {
			const subItems = getDirectoryItems(`${directory}/${item}`, filterPath);
			filteredItems = [...filteredItems, ...subItems.map((subItem) => `${item}/${subItem}`)];
		}
	});

	return filteredItems;
};