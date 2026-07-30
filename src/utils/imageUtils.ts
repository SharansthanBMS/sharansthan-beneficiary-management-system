export const getDirectDriveUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;

  // Handle drive.google.com/file/d/ID/...
  let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w1000`;
  }
  
  // Handle drive.google.com/uc?id=ID or thumbnail?id=ID
  if (url.includes('drive.google.com') && url.includes('id=')) {
    match = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}=w1000`;
    }
  }
  
  return url;
};

export const generateThumbnailFromBase64 = (base64: string, maxWidth = 300, maxHeight = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!base64 || !base64.startsWith('data:image/')) {
      return resolve(base64); // not a data url or invalid
    }
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
    img.src = base64;
  });
};
