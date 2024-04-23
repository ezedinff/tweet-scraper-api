import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageService {
  async save(url: string): Promise<string> {
    try {
      // Fetch the image data from the URL
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data, 'binary');

      // Extract the filename from the URL
      const filename = path.basename(url);

      // Define the directory where images will be saved
      const directory = path.join(__dirname, '..', '../../..', 'images');

      // Create the directory if it doesn't exist
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      // Construct the full path to save the image
      const { imagePath, extension } = this.getImagePath(directory, filename);

      // Write the image data to the file
      fs.writeFileSync(imagePath, imageData);

      return `/images/${filename.replace(/\?.*$/, '')}.${extension || 'jpg'}`; // Return the path where the image is saved
    } catch (error) {
      console.error('Error saving image:', error);
      throw new Error('Failed to save image');
    }
  }

  private getImagePath(
    directory: string,
    filename: string,
  ): { imagePath: string; extension: string } {
    const baseName = path.parse(filename).name;
    const extension = new URLSearchParams(filename.split('?')[1]).get('format');
    const imagePath = path.join(
      directory,
      `${baseName.replace(/\?.*$/, '')}.${extension || 'jpg'}`,
    );
    return { imagePath, extension };
  }
}
