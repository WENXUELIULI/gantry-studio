from PIL import Image, ImageDraw, ImageFont, ImageOps
import subprocess, os, io

ROOT = r'E:\asd\gantry-studio\frontend\public\assets'
FFMPEG = r'C:\Users\Assassin\AppData\Local\ms-playwright\ffmpeg-1013\ffmpeg-win64.exe'
W, H, FPS, SECONDS = 1280, 720, 24, 4
FRAMES = FPS * SECONDS
FONT = ImageFont.truetype(r'C:\Windows\Fonts\arialbd.ttf', 18)
SMALL = ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf', 12)

FILMS = {
    'film-cargo': ('warehouse-01.jpg', 'CARGO / FLOW'),
    'film-port': ('industry/containers.jpg', 'PORT / CONTAINERS'),
    'film-glass': ('glassware-01.jpg', 'GLASS / LIGHT'),
    'film-energy': ('wind-01.jpg', 'ENERGY / FIELD'),
    'film-chip': ('chip-01.jpg', 'SUBSTRATE / CLEANROOM'),
    'film-line': ('glass-02.jpg', 'LINE / ASSEMBLY'),
    'film-lab': ('industry/lab-glass.jpg', 'LAB / REAGENT'),
    'film-machine': ('industry/machine-detail.jpg', 'MACHINE / PRECISION'),
    'film-robotics': ('glass-02.jpg', 'ROBOTICS / CELL'),
    'film-instrument': ('engineer-02.jpg', 'INSTRUMENT / MEASURE'),
    'film-architecture': ('glass-03.jpg', 'FACADE / LIGHT'),
    'film-medical': ('engineer-01.jpg', 'MEDICAL / CLEAN'),
}

def frame(base, name, label, t):
    # base is a square-ish fit; zoom and pan over the frame.
    zoom = 1.03 + 0.10 * t
    pan_x = (t - 0.5) * 0.04
    pan_y = 0.02 * t
    bw, bh = base.size
    crop_w = bw / zoom
    crop_h = bh / zoom
    cx = bw / 2 + bw * pan_x
    cy = bh / 2 + bh * pan_y
    left = max(0, min(bw - crop_w, cx - crop_w / 2))
    top = max(0, min(bh - crop_h, cy - crop_h / 2))
    im = base.crop((left, top, left + crop_w, top + crop_h)).resize((W, H), Image.LANCZOS)
    # dark gradient
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for y in range(H):
        alpha = int(70 + 120 * (y / H))
        d.line((0, y, W, y), fill=(5, 8, 7, alpha))
    im = Image.alpha_composite(im.convert('RGBA'), overlay)
    # moving scanline
    sy = int((t * 1.6 % 1.0) * H)
    scan = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scan)
    sd.rectangle((0, sy, W, min(H, sy + 2)), fill=(230, 107, 44, 95))
    im = Image.alpha_composite(im, scan)
    d = ImageDraw.Draw(im)
    d.rectangle((36, 32, 150, 58), fill=(230, 107, 44, 255))
    d.text((46, 38), 'GANTRY FILM', font=SMALL, fill=(20, 20, 18, 255))
    d.text((36, H - 54), label, font=FONT, fill=(240, 238, 228, 255))
    d.text((36, H - 30), f'SCROLL-DRIVEN / {SECONDS:02d}:00  ·  {name}', font=SMALL, fill=(210, 208, 198, 255))
    return im.convert('RGB')

for name, (src, label) in FILMS.items():
    path = os.path.join(ROOT, src)
    base = ImageOps.fit(Image.open(path).convert('RGB'), (1400, 900), Image.LANCZOS)
    out = os.path.join(ROOT, name + '.webm')
    tmp = os.path.join(ROOT, name + '.mjpeg')
    with open(tmp, 'wb') as fh:
        for i in range(FRAMES):
            f = frame(base, name, label, i / (FRAMES - 1))
            f.save(fh, 'JPEG', quality=84)
    cmd = [FFMPEG, '-y', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-framerate', str(FPS),
           '-i', tmp, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', out]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(tmp)
    print(name, os.path.getsize(out))
