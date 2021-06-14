import { JwtService } from './jwt.service';
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from '../common/common.constants';


const TEST_KEY = 'testKey';

describe('JwtService', () => {

  let service: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [JwtService, {
        provide: CONFIG_OPTIONS,
        useValue: { privatKey: TEST_KEY }
      }]
    }).compile();
    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('sign');
  it.todo('verify');

});