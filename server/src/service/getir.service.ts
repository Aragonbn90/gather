import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { GetirDTO } from './dto/getir.dto';
import { GetirMapper } from './mapper/getir.mapper';
import { GetirRepository } from '../repository/getir.repository';
import { Getir } from '../domain/getir.entity';
import { FileService } from './file.service';
import { BaseService } from './base.service';
import { HttpService } from '@nestjs/axios';


const relationshipNames = [];
const RETAILER = 'Getir';

@Injectable()
export class GetirService extends BaseService {

  logger = new Logger('GetirService');

  constructor(
    @InjectRepository(GetirRepository) private getirRepository: GetirRepository,
    protected fileService: FileService,
    protected httpService: HttpService,
  ) {
    super(fileService, httpService);
  }

  protected getRetailer(): string {
    return RETAILER;
  }

  protected async queryOne(url: string): Promise<any> {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8;',
      'accept-version': '2.0.0',
      'Accept-Language': 'en',
      'token': '1639473554517b2028a2352bf5d2761d2fa8b8f1cebc8ec3bf1aa42752c1d873428038dc5d338',
      'Device-Type': 'Android',
      'access_token': '1639473554517b2028a2352bf5d2761d2fa8b8f1cebc8ec3bf1aa42752c1d873428038dc5d338',
      'Host': 'getirx-client-api-gateway.getirapi.com',
      'Connection': 'Keep-Alive',
      'Accept-Encoding': 'gzip',
      'User-Agent': 'okhttp/3.14.9',
      'Accept': '*/*',
    };
    const res = await this.httpService.get(url, { headers }).toPromise();
    // this.logger.log('Product res: ', JSON.stringify(res.data.data));
    return [res.data.data.product, res.data.data.product.picURLs];
  }

  protected async extractOne(product: any): Promise<GetirDTO> {
    const entity = this.productToEntity(product);
    this.getirRepository.save(entity);
    return GetirMapper.fromEntityToDTO(entity);
  }

  private productToEntity(product: any): Getir {
    const entity = new Getir();
    entity.url = `https://getirx-client-api-gateway.getirapi.com/products/${product.id}`;
    entity.productNo = product.id;
    entity.name = product.name;
    entity.imageUrls = product.picURLs;
    return entity;
  }

  async search(url: string, q: string): Promise<GetirDTO[]> {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8;',
      'accept-version': '2.0.0',
      'Accept-Language': 'en',
      'token': '1639473554517b2028a2352bf5d2761d2fa8b8f1cebc8ec3bf1aa42752c1d873428038dc5d338',
      'Device-Type': 'Android',
      'access_token': '1639473554517b2028a2352bf5d2761d2fa8b8f1cebc8ec3bf1aa42752c1d873428038dc5d338',
      'Host': 'getirx-client-api-gateway.getirapi.com',
      'Connection': 'Keep-Alive',
      'Accept-Encoding': 'gzip',
      'User-Agent': 'okhttp/3.14.9',
      'Accept': '*/*',
    };

    const body = { keyword: q };
    const res = await this.httpService.post(url, body, { headers }).toPromise();
    await this.store(['search'], this.urlToProductId(`${url}?q=${q}`), Buffer.from(JSON.stringify(res.data.data.products)), '.json');

    const entities = res.data.data.products.map(this.productToEntity);
    this.getirRepository.save(entities);
    return entities.map(GetirMapper.fromDTOtoEntity);
  }

  async category(url: string): Promise<GetirDTO[]> {
    return null;
  }


}
