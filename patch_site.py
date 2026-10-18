#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""為既有 docs/ 頁面加上「3D 世界」入口，並更新版號。可重複執行（幂等）。"""
import os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(ROOT, "docs")
OLD_VER = "v20261018.3"
NEW_VER = "v20261019.2"

CSS_STORY = """
.world-entry{display:flex;align-items:center;gap:.9em;flex-wrap:wrap;
  margin:0 0 1.8em;padding:.85em 1.05em;border:1px solid #d8cbb8;border-radius:8px;
  background:#f3ece0;line-height:1.7}
.world-entry .t{flex:1;min-width:12em;font-size:.88rem;color:#6b5a48}
.world-entry a{display:inline-block;background:var(--tea);color:#fdf9f2;text-decoration:none;
  border-radius:999px;padding:.42em 1.15em;font-size:.88rem;letter-spacing:.06em;white-space:nowrap}
.world-entry a:hover{background:#734a22}
"""

CSS_INDEX = """
.worldcard{display:block;text-decoration:none;color:var(--ink);
  border:1px solid #d8cbb8;border-radius:10px;padding:1.3em 1.4em;
  background:linear-gradient(135deg,#f3ece0,#faf7f2);
  transition:box-shadow .15s,transform .15s}
.worldcard:hover{box-shadow:0 4px 16px rgba(43,43,43,.16);transform:translateY(-2px)}
.worldcard .wc-t{font-size:1.15rem;letter-spacing:.05em;margin-bottom:.25em}
.worldcard .wc-s{font-size:.9rem;color:#6b5a48;line-height:1.9;margin-bottom:.8em}
.worldcard .wc-go{display:inline-block;background:var(--tea);color:#fdf9f2;
  border-radius:999px;padding:.42em 1.15em;font-size:.88rem;letter-spacing:.08em}
"""

def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()

def write(p, s):
    with open(p, "w", encoding="utf-8") as f:
        f.write(s)

def patch_story(fname, wid):
    p = os.path.join(DOCS, fname)
    s = read(p)
    changed = False
    if "world-entry" not in s:
        # CSS
        s = s.replace("</style>", CSS_STORY + "</style>", 1)
        block = (f'<div class="world-entry"><span class="t">'
                 f'這一帖有一個可以走進去的立體場景，裡面藏著幾段記憶。</span>'
                 f'<a href="worlds/index.html#{wid}">走進 3D 世界 →</a></div>\n')
        s = s.replace('<figure class="cover">', block + '<figure class="cover">', 1)
        changed = True
    s = s.replace(OLD_VER, NEW_VER)
    write(p, s)
    return changed

def patch_index():
    p = os.path.join(DOCS, "index.html")
    s = read(p)
    changed = False
    if "worldcard" not in s:
        s = s.replace("</style>", CSS_INDEX + "</style>", 1)
        block = """<section class="sec"><h2>3D 世界</h2>
<a class="worldcard" href="worlds/index.html">
<div class="wc-t">十帖，各有一個可以走進去的立體場景</div>
<div class="wc-s">用滑鼠拖曳環繞、滾輪縮放，點亮場景裡藏的四十段記憶。走完一帖，就讀懂一帖。</div>
<span class="wc-go">進入 3D 世界 →</span>
</a></section>
"""
        s = s.replace('<section class="sec">', block + '<section class="sec">', 1)
        changed = True
    s = s.replace(OLD_VER, NEW_VER)
    write(p, s)
    return changed

def main():
    n = 0
    for i in range(1, 11):
        if patch_story(f"s{i:02d}.html", f"s{i:02d}"):
            n += 1
    n += 1 if patch_index() else 0
    # 外傳頁只更新版號
    for i in range(1, 22):
        p = os.path.join(DOCS, f"o{i:02d}.html")
        if os.path.exists(p):
            s = read(p)
            if OLD_VER in s:
                write(p, s.replace(OLD_VER, NEW_VER))
    print(f"patched story/index entries: {n}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
