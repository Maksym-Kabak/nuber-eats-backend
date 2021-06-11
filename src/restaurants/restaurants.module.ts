import { Module } from '@nestjs/common';
import { RestaurantsResolver } from "./restaurants.resolver";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Restaurant } from "./entites/restaurant.entity";
import { RestaurantsService } from "./restaurants.service";

@Module({
  imports:[TypeOrmModule.forFeature([Restaurant])],
  providers: [RestaurantsResolver, RestaurantsService]
})
export class RestaurantsModule {}
