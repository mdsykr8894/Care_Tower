"""Render an offline QR SVG with a bundled BSD-licensed qrcode generator."""
import sys, os, html
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'vendor'))
import qrcode
url = sys.argv[1]
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=6,border=4)
qr.add_data(url)
qr.make(fit=True)
mat = qr.get_matrix()
n = len(mat)
rects=[]
for y,row in enumerate(mat):
    for x,v in enumerate(row):
        if v: rects.append(f'<rect x="{x}" y="{y}" width="1" height="1"/>')
print(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" width="300" height="300"><rect width="100%" height="100%" fill="#fffdf7"/><g fill="#5e5663">'+''.join(rects)+'</g></svg>')
