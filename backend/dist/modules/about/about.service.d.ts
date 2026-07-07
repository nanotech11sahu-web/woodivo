import { Model } from 'mongoose';
import { AboutPageDocument } from './schemas/about-page.schema';
import { UpdateAboutPageDto } from './dto/update-about-page.dto';
export declare class AboutService {
    private readonly aboutPageModel;
    constructor(aboutPageModel: Model<AboutPageDocument>);
    get(): Promise<AboutPageDocument>;
    update(dto: UpdateAboutPageDto): Promise<AboutPageDocument>;
}
