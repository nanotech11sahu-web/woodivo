import { HydratedDocument, Types } from 'mongoose';
export type EnquiryDocument = HydratedDocument<Enquiry>;
export declare enum EnquiryStatus {
    NEW = "new",
    SEEN = "seen",
    CONTACTED = "contacted",
    CLOSED = "closed"
}
export declare enum EnquirySource {
    HOMEPAGE = "homepage",
    PRODUCT = "product",
    CATEGORY = "category",
    PROJECT = "project",
    CONTACT = "contact",
    FLOATING_CTA = "floating_cta",
    ABOUT = "about"
}
export declare class Enquiry {
    fullName: string;
    mobileNumber: string;
    city?: string;
    interestedCategory?: Types.ObjectId;
    message?: string;
    status: EnquiryStatus;
    source: EnquirySource;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const EnquirySchema: import("mongoose").Schema<Enquiry, import("mongoose").Model<Enquiry, any, any, any, any, any, Enquiry>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Enquiry, import("mongoose").Document<unknown, {}, Enquiry, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Enquiry & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    fullName?: import("mongoose").SchemaDefinitionProperty<string, Enquiry, import("mongoose").Document<unknown, {}, Enquiry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enquiry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mobileNumber?: import("mongoose").SchemaDefinitionProperty<string, Enquiry, import("mongoose").Document<unknown, {}, Enquiry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enquiry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    city?: import("mongoose").SchemaDefinitionProperty<string | undefined, Enquiry, import("mongoose").Document<unknown, {}, Enquiry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enquiry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    interestedCategory?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Enquiry, import("mongoose").Document<unknown, {}, Enquiry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enquiry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    message?: import("mongoose").SchemaDefinitionProperty<string | undefined, Enquiry, import("mongoose").Document<unknown, {}, Enquiry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enquiry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<EnquiryStatus, Enquiry, import("mongoose").Document<unknown, {}, Enquiry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enquiry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    source?: import("mongoose").SchemaDefinitionProperty<EnquirySource, Enquiry, import("mongoose").Document<unknown, {}, Enquiry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enquiry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<string | undefined, Enquiry, import("mongoose").Document<unknown, {}, Enquiry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enquiry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Enquiry, import("mongoose").Document<unknown, {}, Enquiry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enquiry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Enquiry, import("mongoose").Document<unknown, {}, Enquiry, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enquiry & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Enquiry>;
