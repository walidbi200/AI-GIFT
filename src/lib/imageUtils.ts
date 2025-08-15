export interface ImageUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
}

export interface UnsplashImage {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  credit: {
    name: string;
    username: string;
    link: string;
  };
}

export interface UnsplashResult {
  success: boolean;
  images?: UnsplashImage[];
  error?: string;
}

export class ImageManager {
  private cloudinaryConfig: {
    cloudName: string;
    uploadPreset: string;
  };

  constructor() {
    this.cloudinaryConfig = {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo',
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'demo'
    };
  }

  // Upload to Cloudinary
  async uploadToCloudinary(file: File, options: any = {}): Promise<ImageUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.cloudinaryConfig.uploadPreset);
      formData.append('folder', options.folder || 'blog-images');
      
      if (options.transformation) {
        formData.append('transformation', options.transformation);
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get Unsplash images
  async getUnsplashImages(query: string, count: number = 10): Promise<UnsplashResult> {
    try {
      const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
      if (!accessKey) {
        throw new Error('Unsplash access key not configured');
      }

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${accessKey}`
          }
        }
      );

      const data = await response.json();
      
      return {
        success: true,
        images: data.results.map((img: any) => ({
          id: img.id,
          url: img.urls.regular,
          thumb: img.urls.thumb,
          alt: img.alt_description || query,
          credit: {
            name: img.user.name,
            username: img.user.username,
            link: img.user.links.html
          }
        }))
      };
    } catch (error) {
      console.error('Unsplash API error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Generate optimized image URLs
  getOptimizedUrl(originalUrl: string, options: any = {}): string {
    if (!originalUrl) return '';
    
    const { width, height, quality = 80, format = 'auto' } = options;
    
    // For Cloudinary URLs
    if (originalUrl.includes('cloudinary.com')) {
      const parts = originalUrl.split('/upload/');
      if (parts.length === 2) {
        let transformations = [];
        
        if (width) transformations.push(`w_${width}`);
        if (height) transformations.push(`h_${height}`);
        transformations.push(`q_${quality}`);
        transformations.push(`f_${format}`);
        
        return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
      }
    }
    
    return originalUrl;
  }

  // Get placeholder images from Picsum
  async getPlaceholderImages(count: number = 10): Promise<UnsplashImage[]> {
    const images: UnsplashImage[] = [];
    
    for (let i = 0; i < count; i++) {
      const width = 800;
      const height = 600;
      const id = Math.floor(Math.random() * 1000);
      
      images.push({
        id: `placeholder-${id}`,
        url: `https://picsum.photos/${width}/${height}?random=${id}`,
        thumb: `https://picsum.photos/300/200?random=${id}`,
        alt: `Placeholder image ${id}`,
        credit: {
          name: 'Picsum Photos',
          username: 'picsum',
          link: 'https://picsum.photos/'
        }
      });
    }
    
    return images;
  }

  // Get default blog images
  getDefaultBlogImages(): UnsplashImage[] {
    return [
      {
        id: 'default-1',
        url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
        alt: 'Books and reading',
        credit: {
          name: 'Unsplash',
          username: 'unsplash',
          link: 'https://unsplash.com/'
        }
      },
      {
        id: 'default-2',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
        alt: 'Technology and innovation',
        credit: {
          name: 'Unsplash',
          username: 'unsplash',
          link: 'https://unsplash.com/'
        }
      },
      {
        id: 'default-3',
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=200&fit=crop',
        alt: 'Business and success',
        credit: {
          name: 'Unsplash',
          username: 'unsplash',
          link: 'https://unsplash.com/'
        }
      }
    ];
  }
}
