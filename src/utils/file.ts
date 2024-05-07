import fs from 'fs';

export const createFolder = (path: string): string => {
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
	return fs.readdirSync(path);
};

export const pathExists = (path: string): boolean => {
	return fs.existsSync(path);
};

export const readFile = (path: string, encoding: BufferEncoding = 'utf-8'): string => {
	return fs.readFileSync(path, encoding);
};

export const writeFile = (path: string, data: string, encoding: BufferEncoding = 'utf-8'): void => {
	fs.writeFileSync(path, data, encoding);
};

export const validatePath = (path: string): void => {
	try {
		fs.accessSync(path, fs.constants.F_OK);
	} catch (error) {
		throw new Error('Invalid path');
	}
};