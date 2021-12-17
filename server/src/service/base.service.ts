import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { FileService } from './file.service';
import { HttpService } from '@nestjs/axios';
import { BaseDTO } from './dto/base.dto';

const relationshipNames = [];

// @Injectable()
export abstract class BaseService {

  constructor(
    protected fileService: FileService,
    protected httpService: HttpService,
  ) { }

  async one(url: string): Promise<BaseDTO> {
    //gather
    const [data, imageUrls] = await this.queryOne(url);
    data.url = url;

    //store json and jpg
    this.storeOne(data, imageUrls);

    //extract (and save to database)
    return this.extractOne(data);
  }

  urlToProductId(url: string): string {
    return Buffer.from(url).toString('base64').replace('/', '%2F');
  }

  productIdToUrl(productId: string): string {
    return Buffer.from(productId.replace('%2F', '/')).toString('base64').replace('/', '%2F');
  }

  protected abstract getRetailer(): string
  protected abstract queryOne(url: string): Promise<[any, string[]]>
  protected abstract extractOne(data: any): Promise<BaseDTO>
  protected abstract search(url: string, q: string): Promise<BaseDTO[]>

  private async storeOne(product: any, imageUrls: string[]): Promise<void> {
    const fileName = this.urlToProductId(product.url);
    await this.store(['detail'], fileName, Buffer.from(JSON.stringify(product), 'utf-8'), '.json');
    imageUrls.map(async (imageUrl: string, index: number) => {
      return this.storeImage(fileName + index, imageUrl);
    });
  }

  private async storeImage(fileName: string, url: string): Promise<string> {
    const response = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    return this.fileService.storeAsStream([this.getRetailer(), 'detail'], fileName, '.jpg', response);
  }

  async store(directories: string[], fileName: string, content: Buffer, extension: string): Promise<string> {
    const url = await this.fileService.store([this.getRetailer(), ...directories], fileName, extension, content);
    return url;
  }

  async storeAsStream(directories: string[], fileName: string, url: string): Promise<string> {
    const response = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    return this.fileService.storeAsStream([this.getRetailer(), ...directories], fileName, '.jpg', response);
  }


}
