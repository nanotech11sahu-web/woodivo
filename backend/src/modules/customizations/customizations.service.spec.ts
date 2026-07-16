import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CustomizationsService } from './customizations.service';
import {
  Customization,
  CustomizationStatus,
} from './schemas/customization.schema';
import { Category } from '@modules/categories/schemas/category.schema';
import type { CreateCustomizationDto } from './dto/create-customization.dto';
import type { QueryPublicCustomizationDto } from './dto/query-public-customization.dto';

/**
 * Minimal chainable query mock — every Mongoose call in the service
 * (`.populate().sort().skip().limit().exec()`) is invoked on the same
 * object, so one object with all methods returning `this` covers every
 * call chain used across the service's methods.
 */
function createQueryMock(resolvedValue: unknown) {
  const query: Record<string, jest.Mock> = {};
  const chain = ['populate', 'sort', 'skip', 'limit'];
  chain.forEach((method) => {
    query[method] = jest.fn().mockReturnValue(query);
  });
  query.exec = jest.fn().mockResolvedValue(resolvedValue);
  return query;
}

interface MockCustomizationModel {
  find: jest.Mock;
  findById: jest.Mock;
  countDocuments: jest.Mock;
  deleteOne: jest.Mock;
  bulkWrite: jest.Mock;
  new (dto: unknown): { save: jest.Mock } & Record<string, unknown>;
}

interface MockCategoryModel {
  findById: jest.Mock;
  findOne: jest.Mock;
}

describe('CustomizationsService', () => {
  let service: CustomizationsService;
  let customizationModel: MockCustomizationModel;
  let categoryModel: MockCategoryModel;

  const mockCategoryDoc = {
    _id: 'cat-1',
    slug: 'dining-tables',
    name: 'Dining Tables',
  };

  beforeEach(async () => {
    function CustomizationModelMock(
      this: Record<string, unknown>,
      dto: unknown,
    ) {
      Object.assign(this, dto as object);
      this.save = jest
        .fn()
        .mockResolvedValue({ ...(dto as object), _id: 'new-id' });
    }
    CustomizationModelMock.find = jest.fn();
    CustomizationModelMock.findById = jest.fn();
    CustomizationModelMock.countDocuments = jest.fn();
    CustomizationModelMock.deleteOne = jest.fn();
    CustomizationModelMock.bulkWrite = jest.fn();

    customizationModel =
      CustomizationModelMock as unknown as MockCustomizationModel;

    categoryModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomizationsService,
        {
          provide: getModelToken(Customization.name),
          useValue: customizationModel,
        },
        { provide: getModelToken(Category.name), useValue: categoryModel },
      ],
    }).compile();

    service = module.get<CustomizationsService>(CustomizationsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('saves a new customization when no category is given', async () => {
      const dto: CreateCustomizationDto = {
        title: 'Custom teak console',
        images: [{ url: 'https://example.com/a.jpg' }],
      };

      const result = await service.create(dto);

      expect(result).toMatchObject({ title: 'Custom teak console' });
    });

    it('throws BadRequestException when the given category does not exist', async () => {
      categoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const dto: CreateCustomizationDto = {
        title: 'Custom bench',
        images: [{ url: 'https://example.com/a.jpg' }],
        category: 'missing-id',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllPublic', () => {
    it('only returns active items and paginates the result', async () => {
      const items = [{ _id: '1', title: 'Piece 1' }];
      customizationModel.find.mockReturnValue(createQueryMock(items));
      customizationModel.countDocuments.mockResolvedValue(1);

      const query: QueryPublicCustomizationDto = { page: 1, limit: 20 };
      const result = await service.findAllPublic(query);

      expect(customizationModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: CustomizationStatus.ACTIVE }),
      );
      expect(result.items).toEqual(items);
      expect(result.meta.total).toBe(1);
    });

    it('resolves a category slug to an id before filtering', async () => {
      categoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategoryDoc),
      });
      customizationModel.find.mockReturnValue(createQueryMock([]));
      customizationModel.countDocuments.mockResolvedValue(0);

      const query: QueryPublicCustomizationDto = {
        page: 1,
        limit: 20,
        category: 'dining-tables',
      };
      await service.findAllPublic(query);

      expect(categoryModel.findOne).toHaveBeenCalledWith({
        slug: 'dining-tables',
      });
      expect(customizationModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'cat-1' }),
      );
    });

    it('returns an empty page instead of throwing for an unknown category slug', async () => {
      categoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const query: QueryPublicCustomizationDto = {
        page: 1,
        limit: 20,
        category: 'no-such-category',
      };
      const result = await service.findAllPublic(query);

      expect(result.items).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(customizationModel.find).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when nothing was deleted', async () => {
      customizationModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(service.remove('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('resolves silently when a document was deleted', async () => {
      customizationModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await expect(service.remove('real-id')).resolves.toBeUndefined();
    });
  });

  describe('reorder', () => {
    it('bulk-writes a displayOrder update per item', async () => {
      customizationModel.bulkWrite.mockResolvedValue({});

      await service.reorder({
        items: [
          { id: 'a', displayOrder: 0 },
          { id: 'b', displayOrder: 1 },
        ],
      });

      expect(customizationModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: 'a' },
            update: { $set: { displayOrder: 0 } },
          },
        },
        {
          updateOne: {
            filter: { _id: 'b' },
            update: { $set: { displayOrder: 1 } },
          },
        },
      ]);
    });
  });
});
