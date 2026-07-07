import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import { EnquiriesService } from './enquiries.service';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { QueryEnquiryDto } from './dto/query-enquiry.dto';

@Controller('admin/enquiries')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class EnquiriesAdminController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Get()
  findAll(@Query() query: QueryEnquiryDto) {
    return this.enquiriesService.findAllAdmin(query);
  }

  @Get('stats')
  getStats() {
    return this.enquiriesService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enquiriesService.findByIdAdmin(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEnquiryDto) {
    return this.enquiriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.enquiriesService.remove(id);
  }
}
