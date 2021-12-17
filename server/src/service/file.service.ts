import { Injectable, Logger } from '@nestjs/common';
import { config } from '../config';
import * as fse from 'fs-extra';
import path from 'path';

@Injectable()
export class FileService {

    logger = new Logger('FileService');

    async readJSON(directories: string[], fileName: string): Promise<any> {
        const path = this.path(directories, fileName, '.json');
        return fse.readJSON(path, { encoding: 'utf8' });
    }

    async remove(directories: string[], fileName: string, extension: string = 'json'): Promise<string> {
        const path = this.path(directories, fileName, extension);

        try {
            await fse.remove(path);
            return path;
        } catch (err) {
            throw err;
        }
    }

    async store(directories: string[], uuid: string, extension: string, content: Buffer): Promise<string> {
        const path = this.path(directories, uuid, extension);
        try {
            await fse.writeFile(path, content);
            this.logger.log(`Stored ${path}`);
            return this.url(uuid, extension);
        } catch (err) {
            await fse.remove(path);
            throw err;
        }
    }

    async storeAsStream(directories: string[], fileName: string, extension: string, response: any): Promise<string> {
        const path = this.path(directories, fileName, extension);
        const writer = fse.createWriteStream(path);

        response.data.pipe(writer);

        writer.on('finish', () => {
            this.logger.log(`Stored ${path}`);
        });
        writer.on('error', (err) => {
            this.logger.error(err);
        });
        return path;
    }

    // getFileSize(size: number): number {
    //     return round(size / (1024 * 1024), 2);
    // }

    // getFileExtension = (name: string) => name.split('.').pop();

    getFileExtension = (urlOrName: string) => path.extname(urlOrName);

    private path = (directories: string[], fileName: string, extension: string): string => `${config.get('application.storage')}/${directories.join('/')}/${fileName}${extension}`;

    private url = (code: string, extension: string): string => `${config.get('application.static')}/${code}${extension}`;

    // pathByFilename = (filename: string): string => `${config.get('application.static')}/${filename}`;
}
