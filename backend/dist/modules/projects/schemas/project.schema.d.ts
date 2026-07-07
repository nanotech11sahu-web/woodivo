import { HydratedDocument, Types } from 'mongoose';
import { MediaAsset } from "../../../common/schemas/media-asset.schema";
export type ProjectDocument = HydratedDocument<Project>;
export declare enum ProjectStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare class Project {
    title: string;
    slug: string;
    description?: string;
    clientName?: string;
    location?: string;
    completionYear?: string;
    category?: Types.ObjectId;
    coverImage?: MediaAsset;
    images: MediaAsset[];
    isFeatured: boolean;
    displayOrder: number;
    status: ProjectStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const ProjectSchema: import("mongoose").Schema<Project, import("mongoose").Model<Project, any, any, any, any, any, Project>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Project, import("mongoose").Document<unknown, {}, Project, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    slug?: import("mongoose").SchemaDefinitionProperty<string, Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string | undefined, Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    clientName?: import("mongoose").SchemaDefinitionProperty<string | undefined, Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    location?: import("mongoose").SchemaDefinitionProperty<string | undefined, Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    completionYear?: import("mongoose").SchemaDefinitionProperty<string | undefined, Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    category?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    coverImage?: import("mongoose").SchemaDefinitionProperty<MediaAsset | undefined, Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    images?: import("mongoose").SchemaDefinitionProperty<MediaAsset[], Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isFeatured?: import("mongoose").SchemaDefinitionProperty<boolean, Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    displayOrder?: import("mongoose").SchemaDefinitionProperty<number, Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<ProjectStatus, Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Project, import("mongoose").Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Project>;
