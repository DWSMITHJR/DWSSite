from PIL import Image, ImageOps
import numpy as np

def make_transparent_gif(input_path, output_path, threshold=240):
    try:
        # Open and process the image
        with Image.open(input_path) as img:
            # Convert to RGBA if not already
            img = img.convert("RGBA")
            
            # Convert to numpy array for easier manipulation
            data = np.array(img)
            
            # Create a mask for white/light background
            # Looking for pixels where all RGB values are above threshold
            white_pixels = (data[..., 0] > threshold) & \
                          (data[..., 1] > threshold) & \
                          (data[..., 2] > threshold)
            
            # Create alpha channel (0 = transparent, 255 = opaque)
            alpha = np.ones(data.shape[:2], dtype=np.uint8) * 255
            alpha[white_pixels] = 0
            
            # Create new RGBA image with the alpha channel
            rgba = np.dstack((data[..., :3], alpha))
            
            # Convert back to image
            result = Image.fromarray(rgba, 'RGBA')
            
            # Save as PNG with transparency (better than GIF for quality)
            result.save(output_path, 'PNG', transparency=0)
            
            print(f"Success! Transparent image created at: {output_path}")
            return True
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    # File paths
    image_path = r"c:\Users\donal\source\repos\DWSSite\images\crest.png"
    output_path = r"c:\Users\donal\source\repos\DWSSite\images\crest_transparent.png"
    
    # Convert the image
    if make_transparent_gif(image_path, output_path, threshold=240):
        print("\nTo use in your HTML, update the image source to:")
        print(f'<img src="./images/crest_transparent.png" alt="Lassiter Family Crest" class="family-crest">')
        print("\nNote: Using PNG format for better transparency quality.")
        print("If you need GIF specifically, let me know and we can adjust the script.")
