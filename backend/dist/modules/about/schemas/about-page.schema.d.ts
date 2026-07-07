import { HydratedDocument } from 'mongoose';
import { MediaAsset } from "../../../common/schemas/media-asset.schema";
export type AboutPageDocument = HydratedDocument<AboutPage>;
export declare const ABOUT_PAGE_SINGLETON_KEY = "global";
declare class ValueItem {
    title: string;
    description: string;
}
declare class Milestone {
    year: string;
    title: string;
    description?: string;
}
declare class TeamMember {
    name: string;
    role: string;
    photo?: MediaAsset;
    bio?: string;
}
export declare class AboutPage {
    key: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroImage?: MediaAsset;
    storyTitle?: string;
    storyContent?: string;
    storyImage?: MediaAsset;
    missionText?: string;
    visionText?: string;
    values: ValueItem[];
    milestones: Milestone[];
    teamTitle?: string;
    teamSubtitle?: string;
    teamMembers: TeamMember[];
    ctaTitle?: string;
    ctaText?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const AboutPageSchema: import("mongoose").Schema<AboutPage, import("mongoose").Model<AboutPage, any, any, any, any, any, AboutPage>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    key?: import("mongoose").SchemaDefinitionProperty<string, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    heroTitle?: import("mongoose").SchemaDefinitionProperty<string | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    heroSubtitle?: import("mongoose").SchemaDefinitionProperty<string | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    heroImage?: import("mongoose").SchemaDefinitionProperty<MediaAsset | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    storyTitle?: import("mongoose").SchemaDefinitionProperty<string | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    storyContent?: import("mongoose").SchemaDefinitionProperty<string | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    storyImage?: import("mongoose").SchemaDefinitionProperty<MediaAsset | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    missionText?: import("mongoose").SchemaDefinitionProperty<string | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    visionText?: import("mongoose").SchemaDefinitionProperty<string | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    values?: import("mongoose").SchemaDefinitionProperty<ValueItem[], AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    milestones?: import("mongoose").SchemaDefinitionProperty<Milestone[], AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    teamTitle?: import("mongoose").SchemaDefinitionProperty<string | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    teamSubtitle?: import("mongoose").SchemaDefinitionProperty<string | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    teamMembers?: import("mongoose").SchemaDefinitionProperty<TeamMember[], AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ctaTitle?: import("mongoose").SchemaDefinitionProperty<string | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ctaText?: import("mongoose").SchemaDefinitionProperty<string | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, AboutPage, import("mongoose").Document<unknown, {}, AboutPage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, AboutPage>;
export {};
