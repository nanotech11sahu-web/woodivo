import { HydratedDocument } from 'mongoose';
import { MediaAsset } from "../../../common/schemas/media-asset.schema";
export type BannerDocument = HydratedDocument<Banner>;
export declare enum BannerStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare enum BannerPlacement {
    HERO = "hero",
    CATEGORY = "category",
    PRODUCT = "product",
    BLOG = "blog",
    CONTACT = "contact",
    ABOUT = "about",
    PROJECTS = "projects"
}
export declare class Banner {
    title: string;
    subtitle?: string;
    desktopImage: MediaAsset;
    mobileImage?: MediaAsset;
    ctaLabel?: string;
    ctaLink?: string;
    placement: BannerPlacement;
    displayOrder: number;
    status: BannerStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const BannerSchema: import("mongoose").Schema<Banner, import("mongoose").Model<Banner, any, any, any, any, any, Banner>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Banner, import("mongoose").Document<unknown, {}, Banner, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Banner & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Banner, import("mongoose").Document<unknown, {}, Banner, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    subtitle?: import("mongoose").SchemaDefinitionProperty<string | undefined, Banner, import("mongoose").Document<unknown, {}, Banner, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    desktopImage?: import("mongoose").SchemaDefinitionProperty<MediaAsset, Banner, import("mongoose").Document<unknown, {}, Banner, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mobileImage?: import("mongoose").SchemaDefinitionProperty<MediaAsset | undefined, Banner, import("mongoose").Document<unknown, {}, Banner, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ctaLabel?: import("mongoose").SchemaDefinitionProperty<string | undefined, Banner, import("mongoose").Document<unknown, {}, Banner, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ctaLink?: import("mongoose").SchemaDefinitionProperty<string | undefined, Banner, import("mongoose").Document<unknown, {}, Banner, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    placement?: import("mongoose").SchemaDefinitionProperty<BannerPlacement, Banner, import("mongoose").Document<unknown, {}, Banner, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    displayOrder?: import("mongoose").SchemaDefinitionProperty<number, Banner, import("mongoose").Document<unknown, {}, Banner, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<BannerStatus, Banner, import("mongoose").Document<unknown, {}, Banner, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Banner, import("mongoose").Document<unknown, {}, Banner, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Banner, import("mongoose").Document<unknown, {}, Banner, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Banner>;
