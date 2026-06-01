import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { app } from './firebase';

const storage = getStorage(app);

export async function uploadImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storageRef = ref(storage, `gallery/${fileName}`);
    
    await uploadBytes(storageRef, file, {
      cacheControl: 'public,max-age=3600',
    });
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

export async function getImages(): Promise<string[]> {
  try {
    const galleryRef = ref(storage, 'gallery');
    const res = await listAll(galleryRef);
    
    const urls = await Promise.all(
      res.items.map((itemRef) => getDownloadURL(itemRef))
    );
    
    // Sort roughly by parsing out the timestamp if possible, or just reverse so newest is first
    return urls.reverse();
  } catch (error) {
    console.error('Error getting images:', error);
    return [];
  }
}

export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // We can extract the file name from the tokenized Firebase URL
    // e.g. https://firebasestorage.googleapis.com/.../gallery%2FfileName.ext?alt=media
    const decodedUrl = decodeURIComponent(imageUrl);
    const pathRegex = /gallery\/([^?]+)/;
    const match = decodedUrl.match(pathRegex);
    
    if (match && match[1]) {
      const fileName = match[1];
      const imageRef = ref(storage, `gallery/${fileName}`);
      await deleteObject(imageRef);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

export async function uploadMainImage(file: File): Promise<string | null> {
  try {
    const mainRef = ref(storage, 'main');
    
    // Try to delete existing main images first to keep it clean
    try {
      const existing = await listAll(mainRef);
      await Promise.all(existing.items.map(item => deleteObject(item)));
    } catch (e) {
      // Ignore if it fails
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storageRef = ref(storage, `main/${fileName}`);
    
    await uploadBytes(storageRef, file, {
      cacheControl: 'public,max-age=3600',
    });
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading main image:', error);
    return null;
  }
}

export async function getMainImage(): Promise<string | null> {
  try {
    const mainRef = ref(storage, 'main');
    const res = await listAll(mainRef);
    
    if (res.items.length === 0) {
      return null;
    }
    
    // Just return the first one found
    const downloadURL = await getDownloadURL(res.items[0]);
    return downloadURL;
  } catch (error) {
    console.error('Error getting main image:', error);
    return null;
  }
}

export async function deleteMainImage(imageUrl: string): Promise<boolean> {
  try {
    const decodedUrl = decodeURIComponent(imageUrl);
    const pathRegex = /main\/([^?]+)/;
    const match = decodedUrl.match(pathRegex);
    
    if (match && match[1]) {
      const fileName = match[1];
      const imageRef = ref(storage, `main/${fileName}`);
      await deleteObject(imageRef);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting main image:', error);
    return false;
  }
}
