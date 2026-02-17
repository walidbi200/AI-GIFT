export interface ImageUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
}

export class ImageManager {
  // Validate image URL
  static validateImageUrl(url: string): boolean {
    if (!url.trim()) return true; // Empty URL is valid (optional)

    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Generate optimized image URLs (basic implementation)
  static getOptimizedUrl(originalUrl: string, options: any = {}): string {
    if (!originalUrl) return '';

    const { width, height, quality = 80, format = 'auto' } = options;

    // For Cloudinary URLs (if used)
    if (originalUrl.includes('cloudinary.com')) {
      const parts = originalUrl.split('/upload/');
      if (parts.length === 2) {
        const transformations = [];

        if (width) transformations.push(`w_${width}`);
        if (height) transformations.push(`h_${height}`);
        transformations.push(`q_${quality}`);
        transformations.push(`f_${format}`);

        return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
      }
    }

    return originalUrl;
  }

  // Get placeholder images from Picsum (fallback)
  static getPlaceholderImages(
    count: number = 3
  ): Array<{ id: string; url: string; alt: string }> {
    const images = [];

    for (let i = 0; i < count; i++) {
      const width = 800;
      const height = 600;
      const id = Math.floor(Math.random() * 1000);

      images.push({
        id: `placeholder-${id}`,
        url: `https://picsum.photos/${width}/${height}?random=${id}`,
        alt: `Placeholder image ${id}`,
      });
    }

    return images;
  }

  // Get default blog images (fallback)
  static getDefaultBlogImages(): Array<{
    id: string;
    url: string;
    alt: string;
  }> {
    return [
      {
        id: 'default-1',
        url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
        alt: 'Books and reading',
      },
      {
        id: 'default-2',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        alt: 'Technology and innovation',
      },
      {
        id: 'default-3',
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
        alt: 'Business and success',
      },
    ];
  }
}
