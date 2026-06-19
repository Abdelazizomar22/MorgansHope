import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

let client: SupabaseClient | null = null;

export function isSupabaseStorageConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function getSupabaseAdmin() {
  if (!isSupabaseStorageConfigured()) {
    throw new Error('Supabase Storage is not configured.');
  }
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export async function createPrivateUpload(bucket: string, objectPath: string) {
  const { data, error } = await getSupabaseAdmin().storage
    .from(bucket)
    .createSignedUploadUrl(objectPath, { upsert: false });
  if (error || !data) throw error || new Error('Could not create signed upload URL.');
  return data;
}

export async function downloadPrivateObject(bucket: string, objectPath: string) {
  const { data, error } = await getSupabaseAdmin().storage.from(bucket).download(objectPath);
  if (error || !data) throw error || new Error('Could not download private object.');
  return Buffer.from(await data.arrayBuffer());
}

export async function removePrivateObject(bucket: string, objectPath: string) {
  const { error } = await getSupabaseAdmin().storage.from(bucket).remove([objectPath]);
  if (error) throw error;
}

export async function createPrivateReadUrl(bucket: string, objectPath: string, expiresIn = 300) {
  const { data, error } = await getSupabaseAdmin().storage
    .from(bucket)
    .createSignedUrl(objectPath, expiresIn, { download: false });
  if (error || !data) throw error || new Error('Could not create signed read URL.');
  return data.signedUrl;
}
