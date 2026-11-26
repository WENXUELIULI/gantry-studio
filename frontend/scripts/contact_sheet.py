from PIL import Image, ImageDraw
import glob, os

files = sorted(glob.glob(r'E:\asd\gantry-studio\frontend\public\assets\industry\*.jpg'))
cols, tw, th = 3, 420, 280
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw, rows * (th + 28)), 'white')
draw = ImageDraw.Draw(sheet)
for i, path in enumerate(files):
    im = Image.open(path)
    im.thumbnail((tw, th))
    x = (i % cols) * tw
    y = (i // cols) * (th + 28)
    sheet.paste(im, (x + (tw - im.width) // 2, y))
    draw.text((x + 8, y + th + 6), os.path.basename(path), fill='black')
out = r'E:\asd\gantry-studio\frontend\screenshots\industry-sheet.png'
sheet.save(out)
print(out, len(files))
