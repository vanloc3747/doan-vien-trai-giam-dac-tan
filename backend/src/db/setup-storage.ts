import { supabase } from '../lib/supabase';
import { MEMBER_PHOTOS_BUCKET, BRANDING_BUCKET } from '../lib/storage';

async function ensureBucket(name: string, isPublic: boolean) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  if (buckets.some((b) => b.name === name)) {
    console.log(`Bucket "${name}" đã tồn tại, bỏ qua.`);
    return;
  }

  const { error } = await supabase.storage.createBucket(name, { public: isPublic });
  if (error) throw error;
  console.log(`Đã tạo bucket "${name}" (${isPublic ? 'public' : 'private'}).`);
}

async function main() {
  await ensureBucket(MEMBER_PHOTOS_BUCKET, false);
  await ensureBucket(BRANDING_BUCKET, true);
  console.log('Hoàn tất thiết lập Supabase Storage.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
