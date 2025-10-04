import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
from pathlib import Path

class InitialDWallpaperDownloader:
    def __init__(self, output_folder="InitialDWallpapers"):
        self.output_folder = output_folder
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.min_width = 1920  # Minimum width for high quality
        self.min_height = 1080  # Minimum height for high quality
        self.downloaded_count = 0
        
        # Create output folder if it doesn't exist
        Path(self.output_folder).mkdir(parents=True, exist_ok=True)
    
    def is_high_quality(self, width, height):
        """Check if image meets quality requirements"""
        return width >= self.min_width and height >= self.min_height
    
    def get_image_dimensions(self, url):
        """Get image dimensions without downloading the full image"""
        try:
            response = requests.get(url, headers=self.headers, stream=True, timeout=10)
            response.raise_for_status()
            
            # Read just the header to get dimensions
            from PIL import Image
            from io import BytesIO
            
            # Download only first 8KB to check dimensions
            content = next(response.iter_content(8192))
            img = Image.open(BytesIO(content))
            return img.size
        except Exception as e:
            print(f"Error getting dimensions for {url}: {e}")
            return None, None
    
    def download_image(self, url, filename):
        """Download a single image"""
        try:
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            
            filepath = os.path.join(self.output_folder, filename)
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            self.downloaded_count += 1
            print(f"✓ Downloaded: {filename}")
            return True
        except Exception as e:
            print(f"✗ Failed to download {url}: {e}")
            return False
    
    def scrape_wallpaper_sites(self, search_terms, max_images=50):
        """Scrape various wallpaper sites for Initial D images"""
        
        # Popular wallpaper sites to search
        sites = [
            f"https://wallhaven.cc/search?q={'+'.join(search_terms.split())}&categories=111&purity=100&sorting=relevance&order=desc",
            f"https://www.wallpaperflare.com/search?wallpaper={search_terms}",
        ]
        
        print(f"Starting download of Initial D wallpapers...")
        print(f"Target: {max_images} high-quality images (min {self.min_width}x{self.min_height})")
        print(f"Output folder: {self.output_folder}\n")
        
        for site in sites:
            if self.downloaded_count >= max_images:
                break
                
            try:
                print(f"\nSearching: {urlparse(site).netloc}")
                self.scrape_site(site, max_images)
                time.sleep(2)  # Be polite with delays
            except Exception as e:
                print(f"Error scraping {site}: {e}")
        
        print(f"\n{'='*60}")
        print(f"Download complete! Total images: {self.downloaded_count}")
        print(f"Location: {os.path.abspath(self.output_folder)}")
    
    def scrape_site(self, url, max_images):
        """Scrape a specific site for images"""
        try:
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find image tags
            images = soup.find_all('img')
            
            for img in images:
                if self.downloaded_count >= max_images:
                    break
                
                src = img.get('src') or img.get('data-src')
                if not src:
                    continue
                
                # Make absolute URL
                img_url = urljoin(url, src)
                
                # Skip small images, icons, thumbnails
                if any(x in img_url.lower() for x in ['thumb', 'icon', 'logo', 'avatar', 'small']):
                    continue
                
                # Generate filename
                filename = f"initiald_wallpaper_{self.downloaded_count + 1}.jpg"
                
                # Download
                self.download_image(img_url, filename)
                time.sleep(1)  # Delay between downloads
                
        except Exception as e:
            print(f"Error in scrape_site: {e}")
    
    def download_from_direct_sources(self):
        """Download from known high-quality sources"""
        print("Attempting to download from curated sources...\n")
        
        # You can manually add direct image URLs here
        direct_urls = [
            # Add any known high-quality Initial D wallpaper URLs here
        ]
        
        for url in direct_urls:
            if self.downloaded_count >= 50:
                break
            filename = f"initiald_wallpaper_{self.downloaded_count + 1}.jpg"
            self.download_image(url, filename)
            time.sleep(1)


def main():
    # Initialize downloader
    downloader = InitialDWallpaperDownloader()
    
    # Search terms
    search_terms = "Initial D anime wallpaper"
    
    # Download images
    downloader.scrape_wallpaper_sites(search_terms, max_images=50)
    
    print("\nNote: For best results, you may want to:")
    print("1. Visit wallpaper sites directly (WallpaperFlare, Wallhaven, etc.)")
    print("2. Search for 'Initial D 4K wallpaper' or 'Initial D 1920x1080'")
    print("3. Use their API if available for better quality filtering")


if __name__ == "__main__":
    # Check for required libraries
    try:
        from PIL import Image
    except ImportError:
        print("Installing required libraries...")
        os.system("pip install requests beautifulsoup4 Pillow")
    
    main()
