import os
import glob
from PIL import Image

def create_gif(frame_dir, output_gif, duration=150, max_width=720):
    files = sorted(glob.glob(os.path.join(frame_dir, "*.png")))
    if not files:
        print(f"No frames found in {frame_dir}")
        return False
    
    print(f"Compiling {len(files)} frames from {frame_dir} -> {output_gif}")
    frames = []
    for f in files:
        im = Image.open(f).convert("RGBA")
        if im.width > max_width:
            ratio = max_width / float(im.width)
            new_height = int(float(im.height) * ratio)
            im = im.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Convert to P mode with adaptive palette for crisp GIF output
        alpha = im.split()[-1]
        im_rgb = im.convert("RGB")
        im_p = im_rgb.convert("P", palette=Image.Palette.ADAPTIVE, colors=256)
        frames.append(im_p)
    
    os.makedirs(os.path.dirname(output_gif), exist_ok=True)
    frames[0].save(
        output_gif,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
        optimize=True
    )
    print(f"Saved: {output_gif} ({os.path.getsize(output_gif)} bytes)")
    return True

if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 3:
        frame_dir = sys.argv[1]
        out_gif = sys.argv[2]
        dur = int(sys.argv[3]) if len(sys.argv) > 3 else 150
        create_gif(frame_dir, out_gif, duration=dur)
    else:
        print("Usage: py scripts/compile_gifs.py <frame_dir> <output_gif> [duration_ms]")
