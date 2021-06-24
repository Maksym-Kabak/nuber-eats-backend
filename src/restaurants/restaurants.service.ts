import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Raw, Repository } from 'typeorm';
import { Restaurant } from './entites/restaurant.entity';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entites/category.entity';
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/edit-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/delete-restaurant.dto';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { SearchRestaurantInput, SearchRestaurantOutput } from './dtos/search-restaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { Dish } from './entites/dish.entity';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
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

  async allCategory(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok:true,
        categories,
      };
    } catch (error) {
      return {
        ok:false,
        error:'Cloud not load categories',
      };
    }
  }

  countRestaurants(category: Category) {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return { ok:false, error:'Category not found' };
      }
      const restaurants = await this.restaurants.find({
        where:{
          category,
        },
        take:25,
        skip:(page - 1) * 25,
      });
      category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);
      return {
        ok:true,
        category,
        restaurants,
        totalPages:Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok:false,
        error:'Cloud not load category',
      };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({ skip:(page - 1) * 25, take:25 });
      return {
        ok:true,
        results:restaurants,
        totalPages:Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch (error) {
      return {
        ok:false,
        error:'Could not load restaurants',
      };
    }
  }

  async findRestaurantBuId({ restaurantId }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, { relations:['menu'] });
      if (!restaurant) {
        return {
          ok:false,
          error:'Restaurant not found',
        };
      }
      return {
        ok:true,
        restaurant,
      };
    } catch (error) {
      return {
        ok:false,
        error:'Could not load restaurant',
      };
    }
  }

  async searchRestaurantByName({ query, page }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where:{
          name:Raw(name => `${name} ILIKE '%${query}%'`),
        },
        take:25,
        skip:(page - 1) * 25,
      });
      return {
        ok:true,
        restaurants,
        totalResults,
        totalPages:Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok:false,
        error:'Could not load restaurant',
      };
    }
  }

  async createDish(owner: User, createDishInput: CreateDishInput): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne(createDishInput.restaurantId);
      if (!restaurant) {
        return {
          ok:false,
          error:'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok:false,
          error:'You cant do that',
        };
      }
      await this.dishes.save(this.dishes.create({ ...createDishInput, restaurant }));
      return {
        ok:true,
      };
    } catch (error) {
      console.log(error);
      return {
        ok:true,
        error:'Could not create dish',
      };
    }
  }


  async editDish(owner: User, editDishInput: EditDishInput): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(editDishInput.dishId, { relations:['restaurant'] });
      if (!dish) {
        return {
          ok:false,
          error:'Dish not found',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok:false,
          error:'You cant do that',
        };
      }
      await this.dishes.save([{
        id:editDishInput.dishId,
        ...editDishInput,
      },
      ]);
      return { ok:true };
    } catch (error) {
      return {
        ok:true,
        error:'Could not edit dish',
      };
    }
  }

  async deleteDish(owner: User, { dishId }: DeleteDishInput): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, { relations:['restaurant'] });
      if (!dish) {
        return {
          ok:false,
          error:'Dish not found',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok:false,
          error:'You cant do that',
        };
      }
      await this.dishes.delete(dishId);
      return { ok:true };
    } catch (error) {
      return {
        ok:true,
        error:'Could not delete dish',
      };
    }
  }
}
