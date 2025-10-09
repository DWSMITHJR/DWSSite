from PIL import Image
import numpy as np

# Open the image
image_path = r"c:\Users\donal\source\repos\DWSSite\images\crest.png"
output_path = r"c:\Users\donal\source\repos\DWSSite\images\crest.gif"

try:
    # Open and process the image
    with Image.open(image_path) as img:
        # Convert to RGBA if not already
        img = img.convert("RGBA")
        
        # Convert to numpy array for easier manipulation
        data = np.array(img)
        
        # Create a mask for transparent pixels (assuming white background)
        # This threshold can be adjusted (0-255, higher = more transparent)
        threshold = 240
        mask = (data[..., :3] > threshold).all(axis=-1)
        
        # Make white pixels transparent
        data[..., 3][mask] = 0
        
        # Convert back to image
        transparent_img = Image.fromarray(data, 'RGBA')
        
        # Convert to palette mode with transparency
        transparent_img = transparent_img.convert('P', palette=Image.ADAPTIVE, colors=255)
        
        # Set the transparency index (0 is typically the background)
        transparent_img.info['transparency'] = 0
        
        # Save as GIF with transparency
        transparent_img.save(
            output_path,
            transparency=0,  # Index of the transparent color in the palette
            optimize=True,
            save_all=True
        )
    
    print(f"Success! Transparent GIF created at: {output_path}")
    print("You can now update your HTML to use: <img src=\"./images/crest.gif\" ...>")
    print("Note: If the transparency isn't perfect, you may need to adjust the threshold value in the script.")
    
except Exception as e:
    import traceback
    print(f"An error occurred: {str(e)}")
    print("Error details:")
    traceback.print_exc()
    print("\nPlease make sure the source image exists at:", image_path)
    print("And that you have write permissions to the output directory.")
