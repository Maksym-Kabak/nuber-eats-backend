import { Field, InputType, Int, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { Dish } from '../entites/dish.entity';
import { CoreOutput } from '../../common/dtos/output.dto';


@InputType()
export class EditDishInput extends PickType(PartialType(Dish), ['name', 'options', 'price', 'description']) {
  @Field(type => Int)
  dishId: number;
}

@ObjectType()
export class EditDishOutput extends CoreOutput {
}