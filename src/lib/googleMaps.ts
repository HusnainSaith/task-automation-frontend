declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

let isLoading = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  if (window.google) {
    return Promise.resolve();
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Check if script already exists
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    return new Promise((resolve) => {
      const checkGoogle = () => {
        if (window.google) {
          resolve();
        } else {
          setTimeout(checkGoogle, 100);
        }
      };
      checkGoogle();
    });
  }

  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isLoading = false;
      resolve();
    };
    script.onerror = () => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps'));
    };
    
    document.head.appendChild(script);
  });

  return loadPromise;
};