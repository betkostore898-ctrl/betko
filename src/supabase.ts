import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = 'beitko';

export async function uploadImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

export async function getImages(): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('gallery', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error listing images:', error);
      return [];
    }

    return (data || [])
      .filter((file) => file.name !== '.emptyFolderPlaceholder')
      .map((file) => {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`gallery/${file.name}`);
        return urlData.publicUrl;
      });
  } catch (error) {
    console.error('Error getting images:', error);
    return [];
  }
}

export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `gallery/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

export async function uploadMainImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `main/${fileName}`;

    // Optional: Delete existing images in 'main' folder to keep it clean
    const { data: existing } = await supabase.storage.from(BUCKET_NAME).list('main');
    if (existing && existing.length > 0) {
      const toRemove = existing
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(f => `main/${f.name}`);
      if (toRemove.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(toRemove);
      }
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload main image error:', error);
      return null;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading main image:', error);
    return null;
  }
}

export async function getMainImage(): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('main', {
        limit: 1,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error || !data || data.length === 0) {
      return null;
    }

    const file = data.find((f) => f.name !== '.emptyFolderPlaceholder');
    if (!file) return null;

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`main/${file.name}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error getting main image:', error);
    return null;
  }
}

export async function deleteMainImage(imageUrl: string): Promise<boolean> {
  try {
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `main/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Delete main image error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error deleting main image:', error);
    return false;
  }
}
