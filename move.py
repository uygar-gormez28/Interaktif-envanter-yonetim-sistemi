import os
import shutil

root = r"c:\Users\uygrg\OneDrive\Masaüstü\İnteraktif Envanter Yönetim Sistemi"
frontend_dir = os.path.join(root, "frontend")

if not os.path.exists(frontend_dir):
    os.makedirs(frontend_dir)

files_to_move = [
    "package.json", "package-lock.json", "index.html", "tsconfig.json", 
    "tsconfig.app.json", "tsconfig.node.json", "vite.config.ts", 
    "tailwind.config.js", "postcss.config.js", "eslint.config.js"
]

dirs_to_move = ["src", "public"]

for f in files_to_move:
    src_path = os.path.join(root, f)
    if os.path.exists(src_path):
        shutil.move(src_path, os.path.join(frontend_dir, f))

for d in dirs_to_move:
    src_path = os.path.join(root, d)
    if os.path.exists(src_path):
        shutil.move(src_path, os.path.join(frontend_dir, d))
