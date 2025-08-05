// Image optimization utilities for better SEO and performance

interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'avif';
  loading?: 'lazy' | 'eager';
  sizes?: string;
  srcSet?: string;
}

// Generate optimized image URLs (for use with image CDN services)
export const generateOptimizedImageUrl = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): string => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // If using a CDN like Cloudinary, ImageKit, or similar
  // Replace this with your actual CDN URL transformation logic
  const baseUrl = process.env.REACT_APP_IMAGE_CDN_URL || '';
  
  if (!baseUrl) {
    return src; // Return original if no CDN configured
  }
  
  let transformedUrl = `${baseUrl}/`;
  
  // Add transformations
  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  
  if (transformations.length > 0) {
    transformedUrl += transformations.join(',') + '/';
  }
  
  transformedUrl += src.replace(/^\//, '');
  
  return transformedUrl;
};

// Generate responsive image srcSet
export const generateSrcSet = (src: string, widths: number[] = [320, 640, 768, 1024, 1280, 1920]): string => {
  return widths
    .map(width => `${generateOptimizedImageUrl(src, { width })} ${width}w`)
    .join(', ');
};

// Generate sizes attribute for responsive images
export const generateSizes = (breakpoints: Array<{ maxWidth: string; size: string }> = []): string => {
  const defaultBreakpoints = [
    { maxWidth: '320px', size: '280px' },
    { maxWidth: '640px', size: '600px' },
    { maxWidth: '768px', size: '720px' },
    { maxWidth: '1024px', size: '960px' },
    { maxWidth: '1280px', size: '1200px' }
  ];
  
  const allBreakpoints = breakpoints.length > 0 ? breakpoints : defaultBreakpoints;
  
  return allBreakpoints
    .map(bp => `(max-width: ${bp.maxWidth}) ${bp.size}`)
    .join(', ') + ', 100vw';
};

// Preload critical images
export const preloadImage = (src: string, as: 'image' = 'image', crossorigin?: string) => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  
  if (crossorigin) {
    link.crossOrigin = crossorigin;
  }
  
  document.head.appendChild(link);
};

// Lazy load images with Intersection Observer
export const lazyLoadImage = (img: HTMLImageElement, src: string, srcSet?: string) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement;
          image.src = src;
          if (srcSet) image.srcset = srcSet;
          image.classList.remove('lazy');
          observer.unobserve(image);
        }
      });
    });
    
    observer.observe(img);
  } else {
    // Fallback for browsers without Intersection Observer
    img.src = src;
    if (srcSet) img.srcset = srcSet;
  }
};

// Image component with SEO optimization
export const OptimizedImage: React.FC<ImageConfig & React.ImgHTMLAttributes<HTMLImageElement>> = ({
  src,
  alt,
  width,
  height,
  quality = 80,
  format = 'webp',
  loading = 'lazy',
  sizes,
  srcSet,
  className = '',
  ...props
}) => {
  const optimizedSrc = generateOptimizedImageUrl(src, { width, height, quality, format });
  const responsiveSrcSet = srcSet || generateSrcSet(src);
  const responsiveSizes = sizes || generateSizes();
  
  return (
    <img
      src={optimizedSrc}
      srcSet={responsiveSrcSet}
      sizes={responsiveSizes}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className={`${className} ${loading === 'lazy' ? 'lazy' : ''}`}
      {...props}
    />
  );
};

// Generate image metadata for SEO
export const generateImageMetadata = (src: string, alt: string, width?: number, height?: number) => {
  return {
    url: generateOptimizedImageUrl(src, { width, height }),
    alt,
    width: width || 1200,
    height: height || 630,
    type: 'image/webp'
  };
};

// Common image configurations for the site
export const imageConfigs = {
  hero: {
    width: 1920,
    height: 1080,
    quality: 85,
    format: 'webp' as const,
    sizes: '100vw'
  },
  
  card: {
    width: 400,
    height: 300,
    quality: 80,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
  },
  
  avatar: {
    width: 150,
    height: 150,
    quality: 85,
    format: 'webp' as const,
    sizes: '150px'
  },
  
  logo: {
    width: 200,
    height: 60,
    quality: 90,
    format: 'webp' as const,
    sizes: '200px'
  },
  
  thumbnail: {
    width: 300,
    height: 200,
    quality: 75,
    format: 'webp' as const,
    sizes: '300px'
  },
  
  og: {
    width: 1200,
    height: 630,
    quality: 85,
    format: 'jpg' as const // OG images work better as JPG
  }
};

// Critical images that should be preloaded
export const criticalImages = [
  '/hero-image.jpg',
  '/logo.png',
  '/og-image.jpg'
];

// Preload critical images on page load
export const preloadCriticalImages = () => {
  if (typeof window === 'undefined') return;
  
  criticalImages.forEach(src => {
    preloadImage(generateOptimizedImageUrl(src, imageConfigs.hero));
  });
};

// Image compression utility (for client-side compression before upload)
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Generate WebP fallback for older browsers
export const generateWebPFallback = (src: string): { webp: string; fallback: string } => {
  return {
    webp: generateOptimizedImageUrl(src, { format: 'webp' }),
    fallback: generateOptimizedImageUrl(src, { format: 'jpg' })
  };
};

// Picture element with WebP support
export const PictureWithWebP: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}> = ({ src, alt, width, height, className }) => {
  const { webp, fallback } = generateWebPFallback(src);
  
  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        src={fallback}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading="lazy"
      />
    </picture>
  );
};
