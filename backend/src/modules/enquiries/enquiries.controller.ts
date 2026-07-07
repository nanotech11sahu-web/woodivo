import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';

@Public()
@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEnquiryDto) {
    const enquiry = await this.enquiriesService.create(dto);
    // Deliberately return a minimal payload — the public form only needs to
    // know it succeeded, not the full CRM record (status, notes, etc).
    return {
      id: enquiry._id,
      fullName: enquiry.fullName,
      submittedAt: enquiry.createdAt,
    };
  }
}
