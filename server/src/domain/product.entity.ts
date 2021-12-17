/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entity, Column, JoinColumn, OneToOne, ManyToOne, OneToMany, ManyToMany, JoinTable} from 'typeorm';
import { BaseEntity } from './base/base.entity';




/**
 * Standard product.
 */
@Entity('product')
export class Product extends BaseEntity  {

    @Column({name: "image_urls", nullable: true})
    imageUrls: string;

    @Column({name: "group_id", nullable: true})
    groupId: string;

    @Column({name: "product_no", nullable: true})
    productNo: string;

    @Column({name: "name", nullable: true})
    name: string;


    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

}
