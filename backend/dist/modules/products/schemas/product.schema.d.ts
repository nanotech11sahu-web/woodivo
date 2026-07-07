import { HydratedDocument, Types } from 'mongoose';
import { MediaAsset } from "../../../common/schemas/media-asset.schema";
import { SpecificationItem } from "../../../common/schemas/specification-item.schema";
export type ProductDocument = HydratedDocument<Product>;
export declare enum ProductStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare class Product {
    category: Types.ObjectId;
    name: string;
    slug: string;
    images: MediaAsset[];
    description?: string;
    specifications: SpecificationItem[];
    isFeatured: boolean;
    relatedProducts: Types.ObjectId[];
    displayOrder: number;
    status: ProductStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const ProductSchema: import("mongoose").Schema<Product, import("mongoose").Model<Product, any, any, any, any, any, Product>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Product, import("mongoose").Document<unknown, {}, Product, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    category?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Product, import("mongoose").Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, Product, import("mongoose").Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    slug?: import("mongoose").SchemaDefinitionProperty<string, Product, import("mongoose").Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    images?: import("mongoose").SchemaDefinitionProperty<MediaAsset[], Product, import("mongoose").Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string | undefined, Product, import("mongoose").Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    specifications?: import("mongoose").SchemaDefinitionProperty<SpecificationItem[], Product, import("mongoose").Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isFeatured?: import("mongoose").SchemaDefinitionProperty<boolean, Product, import("mongoose").Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    relatedProducts?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Product, import("mongoose").Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    displayOrder?: import("mongoose").SchemaDefinitionProperty<number, Product, import("mongoose").Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<ProductStatus, Product, import("mongoose").Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Product, import("mongoose").Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Product, import("mongoose").Document<unknown, {}, Product, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Product>;
