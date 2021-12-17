import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { GorillasDTO } from './dto/gorillas.dto';
import { GorillasMapper } from './mapper/gorillas.mapper';
import { GorillasRepository } from '../repository/Gorillas.repository';
import { Gorillas } from '../domain/gorillas.entity';
import { FileService } from './file.service';
import { BaseService } from './base.service';
import { HttpService } from '@nestjs/axios';


const relationshipNames = [];
const RETAILER = 'Gorillas';

@Injectable()
export class GorillasService extends BaseService {

  logger = new Logger('GorillasService');

  constructor(
    @InjectRepository(GorillasRepository) private gorillasRepository: GorillasRepository,
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
      'Authorization': ' Bearer eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcHBsaWNhdGlvbiIsImlzcyI6ImdvcmlsbGFzLW1vbm9saXRoIiwidWlkIjoiUG5XWFY0OTVRSHk3UEJwdzNhcTQ4USIsInVzZXJJZCI6IjYxYjc1NzgxMjg2NzEzNjkxODBjNzNiMSIsInJvbGVzIjpbIlVTRVIiXSwiYXBpVHlwZSI6IkFQUCIsInRhZ3MiOlsiTUFSS0VUX0FQUF9VU0VSIl0sImlhdCI6MTYzOTY5NTIyMywidGVuYW50IjoiWnpSbUJnazNTSnFBRUZadzFQNWNkQSIsInZlcnNpb24iOjJ9.xls8Trb1ttgeCDMOb-5X8wmhmix4foP6r7YwO-Hc7UseA0rIOrE6vsYKuv1euwKe',
      'Content-Type': ' application/json; charset=utf-8',
      'User-Agent': ' Dalvik/2.1.0 (Linux; U; Android 7.1.2; G011A Build/N2G48H)',
      'Host': ' prod-api.gorillas.io',
      'Connection': ' Keep-Alive',
    };
    const res = await this.httpService.get(url, { headers }).toPromise();
    // this.logger.log('Product res: ', JSON.stringify(res.data.data));
    return [res.data.data.product];
  }

  protected async storeOne(product: any): Promise<void> {
    const fileName = this.urlToProductId(product.url);
    await this.store(['detail'], fileName, Buffer.from(JSON.stringify(product), 'utf-8'), '.json');
    product.picURLs.map(async (imageUrl, index) => {
      return this.storeImage(fileName + index, imageUrl);
    });
  }

  protected async extractOne(product: any): Promise<GorillasDTO> {
    const entity = this.productToEntity(product);
    this.gorillasRepository.save(entity);
    return GorillasMapper.fromEntityToDTO(entity);
  }

  private productToEntity(product: any): Gorillas {
    const entity = new Gorillas();
    entity.url = product.url;
    entity.productNo = product.id;
    entity.name = product.name;
    return entity;
  }

  async search(url: string, q: string): Promise<GorillasDTO[]> {
    const headers = {
      'Authorization': 'Bearer eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhcHBsaWNhdGlvbiIsImlzcyI6ImdvcmlsbGFzLW1vbm9saXRoIiwidWlkIjoiUG5XWFY0OTVRSHk3UEJwdzNhcTQ4USIsInVzZXJJZCI6IjYxYjc1NzgxMjg2NzEzNjkxODBjNzNiMSIsInJvbGVzIjpbIlVTRVIiXSwiYXBpVHlwZSI6IkFQUCIsInRhZ3MiOlsiTUFSS0VUX0FQUF9VU0VSIl0sImlhdCI6MTYzOTY5NTIyMywidGVuYW50IjoiWnpSbUJnazNTSnFBRUZadzFQNWNkQSIsInZlcnNpb24iOjJ9.xls8Trb1ttgeCDMOb-5X8wmhmix4foP6r7YwO-Hc7UseA0rIOrE6vsYKuv1euwKe',
      "Content-Type": "application/json",
    };

    const body = { "locality": { "coordinates": { "lat": 49.4522465563542, "lon": 11.0631623802871 } }, "isLazy": false, "locale": "en", "version": "15.25", "os": "android", "appIdentifier": "6bf958c9467bd123", "appName": "getgoodys" };
    const res = await this.httpService.post(url, body, { headers }).toPromise();
    await this.store(['search'], this.urlToProductId(`ABC`), Buffer.from(JSON.stringify(res.data.items)), '.json');
    const entities = res.data.items.map(this.productToEntity);
    this.gorillasRepository.save(entities);
    return entities.map(GorillasMapper.fromDTOtoEntity);
  }

  async category(url: string): Promise<GorillasDTO[]> {
    return null;
  }

  private async storeImage(fileName: string, url: string): Promise<string> {
    const response = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    return this.fileService.storeAsStream([RETAILER, 'detail'], fileName, '.jpg', response);
  }


}
