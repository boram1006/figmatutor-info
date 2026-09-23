import fitz, os, sys
files = {
    "v1": r"D:\Downloads\v1. 공통 페이지.pdf",
    "v2": r"D:\Downloads\v2. AI 심사 페이지.pdf",
    "v3": r"D:\Downloads\v3. 지원하기_NEW.pdf",
    "v4": r"D:\Downloads\v4. 하반기 해커톤용.pdf",
    "v5": r"D:\Downloads\v5. 최종보고서 제출.pdf",
}
tag, x0f, y0f, x1f, y1f, outname = sys.argv[1:7]
target = int(sys.argv[7]) if len(sys.argv) > 7 else 1800
x0f, y0f, x1f, y1f = map(float, (x0f, y0f, x1f, y1f))
doc = fitz.open(files[tag]); page = doc[0]; r = page.rect
clip = fitz.Rect(r.width*x0f, r.height*y0f, r.width*x1f, r.height*y1f)
scale = target / max(clip.width, clip.height)
pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=clip, alpha=False)
outdir = r"design\operations\prd-pdf\img"; os.makedirs(outdir, exist_ok=True)
out = os.path.join(outdir, outname); pix.save(out, jpg_quality=82)
print(f"{out}  {pix.width}x{pix.height}  {os.path.getsize(out)//1024}KB")
doc.close()
