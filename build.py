"""Export the public site without the local editor or its write API."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
dist=root/'dist'
if dist.exists():shutil.rmtree(dist)
dist.mkdir()
for name in ('index.html','styles.css','app.js','assets','content'):
    source=root/name
    if source.is_dir():shutil.copytree(source,dist/name)
    else:shutil.copy2(source,dist/name)
for name in ('alexfallasresume.pdf', 'CNAME'):
    if (root/name).exists():shutil.copy2(root/name,dist/name)
print('Static website exported to',dist)
