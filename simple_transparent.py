from PIL import Image
import numpy as np

# Simple transparent PNG creator
input_path = r"c:\Users\donal\source\repos\DWSSite\images\crest.png"
output_path = r"c:\Users\donal\source\repos\DWSSite\images\crest_transparent.png"

try:
    with Image.open(input_path) as img:
        img = img.convert("RGBA")
        data = np.array(img)
        
        # Create mask for white/light pixels
        white_pixels = (data[..., 0] > 240) & (data[..., 1] > 240) & (data[..., 2] > 240)
        
        # Set alpha channel to 0 for white pixels
        data[white_pixels, 3] = 0
        
        # Create new image
        result = Image.fromarray(data, "RGBA")
        
        # Save as PNG
        result.save(output_path, "PNG")
        
    print(f"Success! Transparent PNG created at: {output_path}")
    print("Update your HTML to use: <img src=\"./images/crest_transparent.png\" ...>")
    
except Exception as e:
    print(f"Error: {e}")
