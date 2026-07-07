import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ABOUT_PAGE_SINGLETON_KEY,
  AboutPage,
  AboutPageDocument,
} from './schemas/about-page.schema';
import { UpdateAboutPageDto } from './dto/update-about-page.dto';

@Injectable()
export class AboutService {
  constructor(
    @InjectModel(AboutPage.name)
    private readonly aboutPageModel: Model<AboutPageDocument>,
  ) {}

  /**
   * One About page document, keyed by ABOUT_PAGE_SINGLETON_KEY — same
   * lazy-upsert-on-read approach as SettingsService.get(), so the public
   * `/about` endpoint returns a sensible empty shape (empty arrays, no
   * hero/story text) before the CMS operator has filled anything in,
   * rather than a 404.
   */
  async get(): Promise<AboutPageDocument> {
    return this.aboutPageModel
      .findOneAndUpdate(
        { key: ABOUT_PAGE_SINGLETON_KEY },
        { $setOnInsert: { key: ABOUT_PAGE_SINGLETON_KEY } },
        { upsert: true, new: true },
      )
      .exec();
  }

  async update(dto: UpdateAboutPageDto): Promise<AboutPageDocument> {
    return this.aboutPageModel
      .findOneAndUpdate(
        { key: ABOUT_PAGE_SINGLETON_KEY },
        { $set: dto },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }
}
