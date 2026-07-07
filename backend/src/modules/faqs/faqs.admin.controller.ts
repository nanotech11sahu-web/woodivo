import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import { ReorderItemsDto } from '@common/dto/reorder-items.dto';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { QueryFaqDto } from './dto/query-faq.dto';
import { FaqStatus } from './schemas/faq.schema';

@Controller('admin/faqs')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class FaqsAdminController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  findAll(@Query() query: QueryFaqDto) {
    return this.faqsService.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.faqsService.findByIdAdmin(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateFaqDto) {
    return this.faqsService.create(dto);
  }

  @Patch('reorder')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  reorder(@Body() dto: ReorderItemsDto) {
    return this.faqsService.reorder(dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  setStatus(@Param('id') id: string, @Body('status') status: FaqStatus) {
    return this.faqsService.setStatus(id, status);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.faqsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.faqsService.remove(id);
  }
}
