import fs from 'fs';
import path from 'path';

/**
 * Cleans files from the storage directory that are older than the specified age
 * @param storagePath Path to the storage directory
 * @param maxAgeHours Maximum age of files in hours before they are deleted
 */
export function cleanStorage(storagePath: string, maxAgeHours: number = 24): void {
  try {
    if (!fs.existsSync(storagePath)) {
      console.log(`Storage path ${storagePath} does not exist.`);
      return;
    }

    const files = fs.readdirSync(storagePath);
    const now = new Date().getTime();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(storagePath, file);
      
      // Skip directories
      if (fs.statSync(filePath).isDirectory()) {
        continue;
      }
      
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtime.getTime();
      
      if (fileAge > maxAgeMs) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`Deleted old file: ${filePath}`);
      }
    }
    
    console.log(`Storage cleanup complete. Deleted ${deletedCount} files.`);
  } catch (error) {
    console.error('Error cleaning storage:', error);
  }
}