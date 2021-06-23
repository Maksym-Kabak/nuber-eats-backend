import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entites/restaurant.entity';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entites/category.entity';
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/edit-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/delete-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
  ) {
  }

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      newRestaurant.category = await this.categories.getOrCreate(createRestaurantInput.categoryName);
      await this.restaurants.save(newRestaurant);
      return {
        ok:true,
      };
    } catch {
      return {
        ok:false,
        error:'Could not create restaurant',
      };
    }
  }

  async editRestaurant(owner: User, editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(editRestaurantInput.restaurantId);
      if (!restaurant) {
        return {
          ok:false,
          error:'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok:false,
          error:'You cant edit a restaurant that you dont own',
        };
      }
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(editRestaurantInput.categoryName);
      }

      await this.restaurants.save([{
        id:editRestaurantInput.restaurantId,
        ...editRestaurantInput,
        ...(category && { category }),
      },
      ]);
      return { ok:true };
    } catch (error) {
      return {
        ok:false,
        error:'Could not edit Restaurants',
      };
    }
  }


  async deleteRestaurant(owner: User, { restaurantId }: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok:false,
          error:'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok:false,
          error:'You cant delete a restaurant that you dont own',
        };
      }
      await this.restaurants.delete(restaurantId);
      return {
        ok:true,
      };
    } catch (error) {
      return {
        ok:false,
        error:'Could not delete restaurant',
      };
    }
  }
}
