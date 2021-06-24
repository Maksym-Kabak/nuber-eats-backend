import { Module } from '@nestjs/common';
import { CategoryResolver, DishResolver, RestaurantsResolver } from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entites/restaurant.entity';
import { RestaurantsService } from './restaurants.service';
import { CategoryRepository } from './repositories/category.repository';
import { Dish } from './entites/dish.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Restaurant, Dish, CategoryRepository])],
  providers:[RestaurantsResolver, CategoryResolver, DishResolver, RestaurantsService],
})
export class RestaurantsModule {
}
