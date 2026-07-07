import { HydratedDocument, Types } from 'mongoose';
export type SeoEntryDocument = HydratedDocument<SeoEntry>;
export declare enum SeoPageType {
    HOME = "home",
    ABOUT = "about",
    CONTACT = "contact",
    GALLERY = "gallery",
    PROJECTS_LISTING = "projects-listing",
    BLOGS_LISTING = "blogs-listing",
    PRODUCT = "product",
    BLOG = "blog",
    CATEGORY = "category",
    PROJECT = "project",
    CUSTOM = "custom"
}
export declare const ENTITY_PAGE_TYPES: readonly [SeoPageType.PRODUCT, SeoPageType.BLOG, SeoPageType.CATEGORY, SeoPageType.PROJECT];
export declare class SeoEntry {
    path: string;
    pageType: SeoPageType;
    entityId?: Types.ObjectId;
    entityLabel?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const SeoEntrySchema: import("mongoose").Schema<SeoEntry, import("mongoose").Model<SeoEntry, any, any, any, any, any, SeoEntry>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SeoEntry, import("mongoose").Document<unknown, {}, SeoEntry, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<SeoEntry & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    path?: import("mongoose").SchemaDefinitionProperty<string, SeoEntry, import("mongoose").Document<unknown, {}, SeoEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoEntry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    pageType?: import("mongoose").SchemaDefinitionProperty<SeoPageType, SeoEntry, import("mongoose").Document<unknown, {}, SeoEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoEntry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    entityId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, SeoEntry, import("mongoose").Document<unknown, {}, SeoEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoEntry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    entityLabel?: import("mongoose").SchemaDefinitionProperty<string | undefined, SeoEntry, import("mongoose").Document<unknown, {}, SeoEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoEntry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    metaTitle?: import("mongoose").SchemaDefinitionProperty<string | undefined, SeoEntry, import("mongoose").Document<unknown, {}, SeoEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoEntry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    metaDescription?: import("mongoose").SchemaDefinitionProperty<string | undefined, SeoEntry, import("mongoose").Document<unknown, {}, SeoEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoEntry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    metaKeywords?: import("mongoose").SchemaDefinitionProperty<string[] | undefined, SeoEntry, import("mongoose").Document<unknown, {}, SeoEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoEntry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ogImage?: import("mongoose").SchemaDefinitionProperty<string | undefined, SeoEntry, import("mongoose").Document<unknown, {}, SeoEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoEntry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    canonicalUrl?: import("mongoose").SchemaDefinitionProperty<string | undefined, SeoEntry, import("mongoose").Document<unknown, {}, SeoEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoEntry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, SeoEntry, import("mongoose").Document<unknown, {}, SeoEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoEntry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, SeoEntry, import("mongoose").Document<unknown, {}, SeoEntry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SeoEntry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, SeoEntry>;
