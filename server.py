"""Local authoring server. Public deployment uses the static export, never this server."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
import argparse, base64, json, os, re, secrets, shutil, tempfile
ROOT = Path(__file__).resolve().parent
TOKEN = secrets.token_urlsafe(32)
CONTENT = ROOT / 'content/home.json'

def validate(value, template, path='content'):
    if type(value) is not type(template): raise ValueError(f'Invalid {path}')
    if isinstance(template, dict):
        if value.keys() != template.keys(): raise ValueError(f'Unexpected fields in {path}')
        for key in template: validate(value[key], template[key], f'{path}.{key}')
    elif isinstance(template, list):
        if len(value) != len(template): raise ValueError(f'Invalid item count in {path}')
        for i, item in enumerate(value): validate(item, template[i], f'{path}.{i}')
    elif isinstance(value, str):
        if len(value) > 20000: raise ValueError(f'{path} is too long')
        if path.endswith('.url') and not (value.startswith(('https://','http://','mailto:')) or (value.startswith('/') and not value.startswith('//'))): raise ValueError('Links must use http, https, mailto, or a local path')
        if path.endswith('.image') and value and not re.fullmatch(r'/assets/uploads/[a-f0-9]+\.(png|jpg|webp|gif)', value): raise ValueError('Please use the image upload control')
        if path.endswith('.slug') and not re.fullmatch('[a-z0-9-]+',value): raise ValueError('Invalid project slug')

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def end_headers(self):
        self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');super().end_headers()
    def json(self,status,data):
        body=json.dumps(data).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
    def allowed_host(self):return self.headers.get('Host') in (f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}')
    def do_GET(self):
        if not self.allowed_host():return self.send_error(403)
        path=urlsplit(self.path).path
        if path=='/api/session':return self.json(200,{'token':TOKEN})
        if path in ('/admin','/admin/'):self.path='/admin.html'
        elif path=='/':self.path='/index.html'
        elif path not in ['/index.html','/styles.css','/app.js','/admin.html','/admin.js','/content/home.json','/alexfallasresume.pdf'] and not path.startswith('/assets/'):return self.send_error(404)
        resolved=Path(self.translate_path(self.path)).resolve()
        if ROOT not in resolved.parents or not resolved.is_file():return self.send_error(404)
        return super().do_GET()
    def do_HEAD(self):
        if not self.allowed_host():return self.send_error(403)
        path=urlsplit(self.path).path
        if path not in ['/','/index.html','/styles.css','/app.js','/admin.html','/admin.js','/content/home.json','/alexfallasresume.pdf'] and not path.startswith('/assets/'):return self.send_error(404)
        return super().do_HEAD()
    def do_POST(self):
        if not self.allowed_host() or self.headers.get('X-Editor-Token')!=TOKEN:return self.json(403,{'error':'Open the editor on this computer to save.'})
        origin=self.headers.get('Origin')
        if origin and origin not in [f'http://localhost:{self.server.server_port}',f'http://127.0.0.1:{self.server.server_port}']:return self.json(403,{'error':'Invalid origin'})
        try:
            length=int(self.headers.get('Content-Length','0'))
            if not 0<length<12000000:raise ValueError('Request too large (image limit: 8 MB)')
            data=json.loads(self.rfile.read(length))
            if self.path=='/api/content':
                validate(data,json.loads(CONTENT.read_text()))
                backup=ROOT/'.local';backup.mkdir(exist_ok=True);shutil.copy2(CONTENT,backup/'home.previous.json')
                with tempfile.NamedTemporaryFile(mode='w',dir=CONTENT.parent,delete=False) as f:json.dump(data,f,indent=2,ensure_ascii=False);f.write('\n');temp=f.name
                os.replace(temp,CONTENT);return self.json(200,{'saved':True})
            if self.path=='/api/upload':
                raw=base64.b64decode(data['data'],validate=True)
                if len(raw)>8*1024*1024:raise ValueError('Image exceeds 8 MB')
                ext='png' if raw.startswith(b'\x89PNG\r\n\x1a\n') else 'jpg' if raw.startswith(b'\xff\xd8\xff') else 'gif' if raw.startswith((b'GIF87a',b'GIF89a')) else 'webp' if raw[:4]==b'RIFF' and raw[8:12]==b'WEBP' else None
                if not ext:raise ValueError('Use a PNG, JPEG, WebP, or GIF image')
                folder=ROOT/'assets/uploads';folder.mkdir(exist_ok=True);name=f'{secrets.token_hex(12)}.{ext}';(folder/name).write_bytes(raw);return self.json(200,{'path':f'/assets/uploads/{name}'})
            return self.json(404,{'error':'Unknown action'})
        except (ValueError,KeyError,TypeError) as error:return self.json(400,{'error':str(error)})

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8000);args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    print(f'Website: http://127.0.0.1:{args.port}\nEditor: http://127.0.0.1:{args.port}/admin',flush=True)
    server.serve_forever()
