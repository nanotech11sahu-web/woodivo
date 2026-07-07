import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { CLOUDINARY_PROVIDER } from './providers/cloudinary.provider';
import type { CloudinaryClient } from './providers/cloudinary.provider';
import { MediaFolder } from '@common/constants/app.constants';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import type { QueryMediaDto } from './dto/query-media.dto';

const CLOUDINARY_ROOT_FOLDER = 'woodivo';

interface CloudinarySearchResource {
  public_id: string;
  secure_url: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  created_at: string;
}

interface CloudinarySearchResult {
  resources: CloudinarySearchResource[];
  next_cursor?: string;
  total_count: number;
}

export interface MediaLibraryAsset {
  publicId: string;
  url: string;
  folder: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  createdAt: string;
}

export interface MediaLibraryResult {
  items: MediaLibraryAsset[];
  nextCursor: string | null;
  totalCount: number;
}

@Injectable()
export class MediaService {
  constructor(
    @Inject(CLOUDINARY_PROVIDER) private readonly cloudinary: CloudinaryClient,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: MediaFolder,
    alt?: string,
  ): Promise<MediaAssetDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.streamUpload(file.buffer, folder);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      alt: alt ?? '',
    };
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder: MediaFolder,
  ): Promise<MediaAssetDto[]> {
    if (!files?.length) {
      throw new BadRequestException('No files provided');
    }

    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }

  async deleteImage(publicId: string): Promise<{ deleted: boolean }> {
    const response = (await this.cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    })) as { result: string };
    return { deleted: response.result === 'ok' };
  }

  // There is no MediaAsset collection in MongoDB — every upload goes
  // straight to Cloudinary and only the resulting `MediaAssetDto` gets
  // saved wherever the *consuming* record (a product, a banner, ...)
  // stores its image fields. Cloudinary is already the source of truth
  // for "what images exist," so the library reads from its Search API
  // instead of introducing a second, sync-prone copy of that data in
  // Mongo. See PHASE17_NOTES.md.
  async listAssets(query: QueryMediaDto): Promise<MediaLibraryResult> {
    const limit = query.limit ?? 24;
    const expression = this.buildSearchExpression(query);

    const result = (await this.cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(limit)
      .next_cursor(query.cursor)
      .execute()) as CloudinarySearchResult;

    return {
      items: result.resources.map((resource) => this.toLibraryAsset(resource)),
      nextCursor: result.next_cursor ?? null,
      totalCount: result.total_count,
    };
  }

  private buildSearchExpression(query: QueryMediaDto): string {
    const folderPath = query.folder
      ? `${CLOUDINARY_ROOT_FOLDER}/${query.folder}`
      : CLOUDINARY_ROOT_FOLDER;

    // `folder:x/*` matches everything in and under that folder — the
    // trailing wildcard is what makes this recursive rather than a single
    // exact-match level. Restricted to `resource_type:image` for the same
    // reason uploads always are (see `imageUploadOptions`): nothing in this
    // app uploads anything else yet.
    const clauses = [`folder:${folderPath}/*`, 'resource_type:image'];

    if (query.search) {
      const sanitized = query.search.replace(/["\\]/g, '').trim();
      if (sanitized) clauses.push(`filename:*${sanitized}*`);
    }

    return clauses.join(' AND ');
  }

  private toLibraryAsset(
    resource: CloudinarySearchResource,
  ): MediaLibraryAsset {
    const withoutRoot = resource.public_id.startsWith(
      `${CLOUDINARY_ROOT_FOLDER}/`,
    )
      ? resource.public_id.slice(CLOUDINARY_ROOT_FOLDER.length + 1)
      : resource.public_id;
    // Every upload goes through `uploadImage(file, folder, ...)`, which
    // always nests under `woodivo/{folder}/...` — so the first path segment
    // after the root is always one of the `MediaFolder` values. Falls back
    // to 'misc' only for anything that predates that convention or was
    // uploaded manually straight to the Cloudinary dashboard.
    const folder = withoutRoot.includes('/')
      ? withoutRoot.split('/')[0]
      : 'misc';

    return {
      publicId: resource.public_id,
      url: resource.secure_url,
      folder,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      createdAt: resource.created_at,
    };
  }

  private streamUpload(
    buffer: Buffer,
    folder: MediaFolder,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: `${CLOUDINARY_ROOT_FOLDER}/${folder}`,
          resource_type: 'image',
        },
        (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
          if (error || !result) {
            reject(
              error instanceof Error
                ? error
                : new Error(error?.message ?? 'Cloudinary upload failed'),
            );
            return;
          }
          resolve(result);
        },
      );

      uploadStream.end(buffer);
    });
  }
}
