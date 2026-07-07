import { HydratedDocument } from 'mongoose';
import { MediaAsset } from "../../../common/schemas/media-asset.schema";
export type TestimonialDocument = HydratedDocument<Testimonial>;
export declare enum TestimonialStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare class Testimonial {
    clientName: string;
    clientLocation?: string;
    projectType?: string;
    clientPhoto?: MediaAsset;
    testimonialText: string;
    rating?: number;
    isFeatured: boolean;
    displayOrder: number;
    status: TestimonialStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const TestimonialSchema: import("mongoose").Schema<Testimonial, import("mongoose").Model<Testimonial, any, any, any, any, any, Testimonial>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Testimonial, import("mongoose").Document<unknown, {}, Testimonial, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Testimonial & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    clientName?: import("mongoose").SchemaDefinitionProperty<string, Testimonial, import("mongoose").Document<unknown, {}, Testimonial, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    clientLocation?: import("mongoose").SchemaDefinitionProperty<string | undefined, Testimonial, import("mongoose").Document<unknown, {}, Testimonial, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    projectType?: import("mongoose").SchemaDefinitionProperty<string | undefined, Testimonial, import("mongoose").Document<unknown, {}, Testimonial, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    clientPhoto?: import("mongoose").SchemaDefinitionProperty<MediaAsset | undefined, Testimonial, import("mongoose").Document<unknown, {}, Testimonial, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    testimonialText?: import("mongoose").SchemaDefinitionProperty<string, Testimonial, import("mongoose").Document<unknown, {}, Testimonial, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rating?: import("mongoose").SchemaDefinitionProperty<number | undefined, Testimonial, import("mongoose").Document<unknown, {}, Testimonial, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isFeatured?: import("mongoose").SchemaDefinitionProperty<boolean, Testimonial, import("mongoose").Document<unknown, {}, Testimonial, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    displayOrder?: import("mongoose").SchemaDefinitionProperty<number, Testimonial, import("mongoose").Document<unknown, {}, Testimonial, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<TestimonialStatus, Testimonial, import("mongoose").Document<unknown, {}, Testimonial, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Testimonial, import("mongoose").Document<unknown, {}, Testimonial, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Testimonial, import("mongoose").Document<unknown, {}, Testimonial, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Testimonial>;
