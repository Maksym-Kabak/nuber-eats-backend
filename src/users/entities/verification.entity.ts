import { v4 as uuid4 } from 'uuid';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Entity, Column, OneToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { User } from './user.entity';


@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {

  @Column()
  @Field(type => String)
  code: string;

  @OneToOne(type => User, {onDelete: 'CASCADE'})
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = uuid4();
  }
}