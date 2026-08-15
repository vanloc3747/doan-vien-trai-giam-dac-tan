import crypto from 'crypto';
import { supabase } from './supabase';

export const MEMBER_PHOTOS_BUCKET = 'member-photos';
export const BRANDING_BUCKET = 'branding';
export const ACTIVITY_REPORT_IMAGES_BUCKET = 'activity-report-images';
export const USER_AVATARS_BUCKET = 'user-avatars';
export const DOCUMENTS_BUCKET = 'documents';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

function randomFilename(prefix: string, mimetype: string) {
  const ext = EXT_BY_MIME[mimetype] ?? '';
  return `${prefix}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
}

async function uploadObject(bucket: string, prefix: string, buffer: Buffer, mimetype: string) {
  const objectPath = randomFilename(prefix, mimetype);
  const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    contentType: mimetype,
    upsert: false,
  });
  if (error) throw error;
  return objectPath;
}

async function deleteObject(bucket: string, objectPath: string) {
  await supabase.storage.from(bucket).remove([objectPath]);
}

export function uploadMemberPhoto(buffer: Buffer, mimetype: string) {
  return uploadObject(MEMBER_PHOTOS_BUCKET, 'member', buffer, mimetype);
}

export function deleteMemberPhoto(objectPath: string) {
  return deleteObject(MEMBER_PHOTOS_BUCKET, objectPath);
}

async function getSignedUrls(
  bucket: string,
  paths: (string | null | undefined)[],
  expiresIn = 3600
): Promise<(string | null)[]> {
  const uniquePaths = [...new Set(paths.filter((p): p is string => !!p))];
  if (uniquePaths.length === 0) return paths.map(() => null);

  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(uniquePaths, expiresIn);
  if (error) throw error;

  const urlByPath = new Map<string, string | null>();
  data.forEach((entry) => {
    urlByPath.set(entry.path ?? '', entry.signedUrl ?? null);
  });

  return paths.map((p) => (p ? urlByPath.get(p) ?? null : null));
}

export function getMemberPhotoSignedUrls(paths: (string | null | undefined)[], expiresIn = 3600) {
  return getSignedUrls(MEMBER_PHOTOS_BUCKET, paths, expiresIn);
}

export async function getMemberPhotoSignedUrl(path: string | null | undefined): Promise<string | null> {
  const [url] = await getMemberPhotoSignedUrls([path]);
  return url;
}

export function uploadActivityReportImage(buffer: Buffer, mimetype: string) {
  return uploadObject(ACTIVITY_REPORT_IMAGES_BUCKET, 'activity-report', buffer, mimetype);
}

export function deleteActivityReportImage(objectPath: string) {
  return deleteObject(ACTIVITY_REPORT_IMAGES_BUCKET, objectPath);
}

export function getActivityReportImageSignedUrls(paths: (string | null | undefined)[], expiresIn = 3600) {
  return getSignedUrls(ACTIVITY_REPORT_IMAGES_BUCKET, paths, expiresIn);
}

export function uploadUserAvatar(buffer: Buffer, mimetype: string) {
  return uploadObject(USER_AVATARS_BUCKET, 'avatar', buffer, mimetype);
}

export function deleteUserAvatar(objectPath: string) {
  return deleteObject(USER_AVATARS_BUCKET, objectPath);
}

export function getUserAvatarSignedUrls(paths: (string | null | undefined)[], expiresIn = 3600) {
  return getSignedUrls(USER_AVATARS_BUCKET, paths, expiresIn);
}

export async function getUserAvatarSignedUrl(path: string | null | undefined): Promise<string | null> {
  const [url] = await getUserAvatarSignedUrls([path]);
  return url;
}

export function uploadBrandingLogo(buffer: Buffer, mimetype: string) {
  return uploadObject(BRANDING_BUCKET, 'logo', buffer, mimetype);
}

export function deleteBrandingLogo(objectPath: string) {
  return deleteObject(BRANDING_BUCKET, objectPath);
}

export function getBrandingPublicUrl(objectPath: string | null): string | null {
  if (!objectPath) return null;
  const { data } = supabase.storage.from(BRANDING_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

export function uploadDocumentFile(buffer: Buffer, mimetype: string) {
  return uploadObject(DOCUMENTS_BUCKET, 'document', buffer, mimetype);
}

export function deleteDocumentFile(objectPath: string) {
  return deleteObject(DOCUMENTS_BUCKET, objectPath);
}

export function getDocumentSignedUrls(paths: (string | null | undefined)[], expiresIn = 3600) {
  return getSignedUrls(DOCUMENTS_BUCKET, paths, expiresIn);
}
