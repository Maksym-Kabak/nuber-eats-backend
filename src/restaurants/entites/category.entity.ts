import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Entity, Column, OneToMany } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract:true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field((type) => String)
  @Column({ unique:true })
  @IsString()
  @Length(5)
  name: string;

  @Field(type => String, { nullable:true })
  @Column({ nullable:true })
  @IsString()
  coverImg: string;

  @Field(type => String)
  @Column({ unique:true })
  @IsString()
  slug: string;


  @Field(type => [Restaurant])
  @OneToMany(type => Restaurant, restaurant => restaurant.category)
  restaurants: Restaurant[];
}
