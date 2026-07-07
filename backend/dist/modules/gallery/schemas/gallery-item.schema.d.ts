import { HydratedDocument } from 'mongoose';
import { MediaAsset } from "../../../common/schemas/media-asset.schema";
export type GalleryItemDocument = HydratedDocument<GalleryItem>;
export declare enum GalleryItemType {
    IMAGE = "image",
    VIDEO = "video"
}
export declare enum GalleryItemStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare class GalleryItem {
    media: MediaAsset;
    caption?: string;
    type: GalleryItemType;
    tags: string[];
    displayOrder: number;
    status: GalleryItemStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const GalleryItemSchema: import("mongoose").Schema<GalleryItem, import("mongoose").Model<GalleryItem, any, any, any, any, any, GalleryItem>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, GalleryItem, import("mongoose").Document<unknown, {}, GalleryItem, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<GalleryItem & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    media?: import("mongoose").SchemaDefinitionProperty<MediaAsset, GalleryItem, import("mongoose").Document<unknown, {}, GalleryItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    caption?: import("mongoose").SchemaDefinitionProperty<string | undefined, GalleryItem, import("mongoose").Document<unknown, {}, GalleryItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<GalleryItemType, GalleryItem, import("mongoose").Document<unknown, {}, GalleryItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    tags?: import("mongoose").SchemaDefinitionProperty<string[], GalleryItem, import("mongoose").Document<unknown, {}, GalleryItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    displayOrder?: import("mongoose").SchemaDefinitionProperty<number, GalleryItem, import("mongoose").Document<unknown, {}, GalleryItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<GalleryItemStatus, GalleryItem, import("mongoose").Document<unknown, {}, GalleryItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, GalleryItem, import("mongoose").Document<unknown, {}, GalleryItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, GalleryItem, import("mongoose").Document<unknown, {}, GalleryItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, GalleryItem>;
