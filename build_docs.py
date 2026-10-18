#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""產生 docs/ 靜態網站：藍星十帖・Cy可樂老師傳（GitHub Pages 用）"""
import html, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PROMPTS = os.path.join(ROOT, "藍星十帖", "prompts")
STORIES = os.path.join(ROOT, "藍星十帖", "stories")
STORIES_O = os.path.join(ROOT, "藍星十帖", "stories-o")
DOCS = os.path.join(ROOT, "docs")
IMG = os.path.join(DOCS, "images")
VERSION = "v20261018.1"
SERIES = "藍星十帖・Cy可樂老師傳"

# ---------------- helpers ----------------
def esc(s): return html.escape(s, quote=True)

def read(p):
    with open(p, encoding="utf-8") as f: return f.read()

def exists_img(name):
    return os.path.exists(os.path.join(IMG, name))

def img_tag(src, alt, cls=""):
    if not exists_img(src): return ""
    c = f' class="{cls}"' if cls else ""
    return f'<img{c} src="images/{src}" alt="{esc(alt)}" loading="lazy">'

def cjk_count(s):
    return len(re.findall(r"[㐀-䶿一-鿿豈-﫿]", s))

def paras(md_text):
    """md 全文 → 逐段 <p>；去掉標題列與地域列"""
    out = []
    for ln in md_text.splitlines():
        t = ln.strip()
        if not t or t.startswith("#") or t.startswith("地域："):
            continue
        out.append(f"<p>{esc(t)}</p>")
    return "\n".join(out)

CSS_COMMON = """
:root{--paper:#faf7f2;--ink:#2b2b2b;--tea:#8b5a2b}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);
  font-family:'Noto Serif TC','Songti TC','PMingLiU',serif;line-height:2.0}
a{color:var(--tea)}
img{max-width:100%}
"""

CSS_READ = CSS_COMMON + """
.site{border-bottom:1px solid rgba(139,90,43,.25);background:rgba(139,90,43,.06)}
.site .wrap{max-width:46em;margin:0 auto;padding:.55rem 1rem}
.site a{color:var(--tea);text-decoration:none;font-weight:700}
.content{max-width:42em;margin:0 auto;padding:1.4rem 1rem 2.5rem}
.cover{margin:0 0 1.2rem;text-align:center}
.cover img{width:100%;border-radius:10px;border:1px solid rgba(139,90,43,.3);
  box-shadow:0 2px 10px rgba(43,43,43,.08)}
.kicker{color:var(--tea);letter-spacing:.12em;margin:0 0 .2rem;font-size:.95rem}
h1{font-size:1.75rem;line-height:1.6;margin:.2rem 0 .4rem;color:var(--ink)}
.region{color:#6b5a48;margin:.1rem 0 1.6rem;font-size:.98rem}
article p{margin:0 0 1.55em;text-align:justify}
.pager{display:flex;justify-content:space-between;gap:1rem;margin-top:2.2rem;
  border-top:1px dashed rgba(139,90,43,.4);padding-top:1.1rem}
.pager a{text-decoration:none;font-weight:700}
.pager .sp{color:rgba(139,90,43,.5)}
footer{border-top:1px solid rgba(139,90,43,.25);margin-top:2rem;
  text-align:center;color:#7a6a58;font-size:.88rem;padding:1.2rem 1rem 1.6rem}
footer .ver{margin:.2rem 0 0;letter-spacing:.08em}
"""

CSS_INDEX = CSS_COMMON + """
.hero{position:relative;background:#efe7db}
.hero img.banner{width:100%;height:300px;object-fit:cover;display:block;filter:saturate(.95)}
.hero .hero-text{max-width:72em;margin:0 auto;padding:1.1rem 1rem .2rem;text-align:center}
.hero h1{margin:0;font-size:2.1rem;letter-spacing:.06em}
.hero p.sub{margin:.3rem 0 1.2rem;color:#6b5a48}
main.wrap{max-width:72em;margin:0 auto;padding:1rem 1rem 2rem}
h2.sec{border-left:6px solid var(--tea);padding-left:.6rem;margin:2.2rem 0 1rem;font-size:1.4rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:1.1rem}
.card{background:#fff;border:1px solid rgba(139,90,43,.3);border-radius:12px;overflow:hidden;
  display:flex;flex-direction:column;box-shadow:0 2px 8px rgba(43,43,43,.06)}
.card a.pic{display:block}
.card a.pic img{width:100%;height:150px;object-fit:cover;display:block}
.card .ph{height:150px;display:flex;align-items:center;justify-content:center;
  color:var(--tea);font-size:1.6rem;letter-spacing:.2em;background:rgba(139,90,43,.08)}
.card .bd{padding:.7rem .9rem .95rem;display:flex;flex-direction:column;gap:.15rem;flex:1}
.meta{display:flex;justify-content:space-between;align-items:center;gap:.4rem}
.no{background:var(--tea);color:#fff;border-radius:999px;padding:.05rem .7rem;font-size:.82rem;white-space:nowrap}
.model{border:1px solid var(--tea);color:var(--tea);border-radius:999px;
  padding:.02rem .6rem;font-size:.78rem;white-space:nowrap;background:rgba(139,90,43,.05)}
.card h3{margin:.25rem 0 .15rem;font-size:1.12rem;line-height:1.6}
.card h3 a{color:var(--ink);text-decoration:none}
.card h3 a:hover{color:var(--tea)}
.region{color:#6b5a48;font-size:.88rem;line-height:1.7;margin:0 0 .5rem}
.read{margin-top:auto;font-weight:700;text-decoration:none;font-size:.92rem}
table{border-collapse:collapse;width:100%;background:#fff;font-size:.92rem;line-height:1.9}
th,td{border:1px solid rgba(139,90,43,.35);padding:.35rem .7rem;text-align:left}
th{background:rgba(139,90,43,.1)}
td.n,th.n{text-align:right;white-space:nowrap}
tr.grp td{background:rgba(139,90,43,.16);font-weight:700}
.note{color:#6b5a48;font-size:.9rem}
.total{font-weight:700;color:var(--tea)}
footer{border-top:1px solid rgba(139,90,43,.25);margin-top:2.5rem;
  text-align:center;color:#7a6a58;font-size:.88rem;padding:1.3rem 1rem 1.6rem}
footer .ver{margin:.2rem 0 0;letter-spacing:.08em}
"""

FONT_LINKS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
  '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&display=swap" rel="stylesheet">')

# ---------------- 資料收集 ----------------
def main_titles():
    """prompts/NN.md 前三行 → (label, name, region)"""
    r = {}
    for i in range(1, 11):
        head = read(os.path.join(PROMPTS, f"{i:02d}.md")).splitlines()[:3]
        title, region = f"第{i}帖", ""
        for ln in head:
            t = ln.strip()
            if t.startswith("#"):
                title = t.lstrip("#").strip()
            elif t.startswith("地域："):
                region = t[len("地域："):].strip()
        label, _, name = title.partition("：")
        r[i] = {"label": label or f"第{i}帖", "name": name or title,
                "full": title, "region": region}
    return r

def side_titles():
    """stories-o/NN.md 首行標題"""
    r = {}
    for i in range(1, 21):
        first = ""
        for ln in read(os.path.join(STORIES_O, f"{i:02d}.md")).splitlines():
            t = ln.strip()
            if t:
                first = t; break
        title = first.lstrip("#").strip() if first.startswith("#") else (first or f"番外{i:02d}")
        label, _, name = title.partition("：")
        r[i] = {"label": label or f"番外{i:02d}", "name": name or title, "full": title}
    return r

MAIN = main_titles()
SIDE = side_titles()

def model_main(i): return f"模型 {i:02d}"        # 模型 01～10
def model_side(i): return f"模型 {i + 10:02d}"    # 模型 11～30

def read_body(path):
    return read(path)

# ---------------- 詳情頁 ----------------
def read_page(fname, full_title, label, name, region, model, cover, body_md,
              prev_link, next_link):
    pprev = (f'<a href="{prev_link[0]}">← {esc(prev_link[1])}</a>' if prev_link
             else '<a href="index.html">↑ 回總覽</a>')
    nnext = (f'<a href="{next_link[0]}">{esc(next_link[1])} →</a>' if next_link
             else '<a href="index.html">↑ 回總覽</a>')
    region_html = f'<p class="region">地域：{esc(region)}</p>' if region else ""
    cover_html = img_tag(cover, f"{full_title} 封面", "cover-img")
    cover_html = f'<div class="cover">{cover_html}</div>' if cover_html else ""
    return f"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="{esc(full_title)}｜{SERIES}，由 {esc(model)} 輔助創作的小說">
<title>{esc(full_title)}｜{SERIES}</title>
{FONT_LINKS}
<style>{CSS_READ}</style>
</head>
<body>
<header class="site"><div class="wrap"><a href="index.html">← {esc(SERIES)}</a></div></header>
<main class="content">
{cover_html}
<p class="kicker">{esc(label)}　·　AI 語言模型：{esc(model)}</p>
<h1>{esc(full_title)}</h1>
{region_html}
<article>
{paras(body_md)}
</article>
<nav class="pager"><span class="sp">{pprev}</span><span class="sp">{nnext}</span></nav>
</main>
<footer>
<p>{esc(SERIES)}｜本篇由 AI 語言模型（{esc(model)}）輔助創作</p>
<p class="ver">{VERSION}</p>
</footer>
</body>
</html>
"""

# ---------------- 索引頁 ----------------
def card(link, label, name, model, region, cover):
    pic = img_tag(cover, f"{name} 封面")
    pic = f'<a class="pic" href="{link}">{pic}</a>' if pic else f'<div class="ph">{esc(label)}</div>'
    region_html = f'<p class="region">{esc(region)}</p>' if region else ""
    return f"""<article class="card">
{pic}
<div class="bd">
<div class="meta"><span class="no">{esc(label)}</span><span class="model">{esc(model)}</span></div>
<h3><a href="{link}">{esc(name)}</a></h3>
{region_html}
<a class="read" href="{link}">閱讀全文 →</a>
</div>
</article>"""

def build_index(stats):
    banner = img_tag("banner.png", f"{SERIES} 橫幅", "banner")
    cards_main = "\n".join(
        card(f"s{i:02d}.html", MAIN[i]["label"], MAIN[i]["name"], model_main(i),
             MAIN[i]["region"], f"cover-{i:02d}.png") for i in range(1, 11))
    cards_side = "\n".join(
        card(f"o{i:02d}.html", SIDE[i]["label"], SIDE[i]["name"], model_side(i),
             "", f"cover-o{i:02d}.png") for i in range(1, 21))

    rows = []
    for i in range(1, 11):
        s = stats[("s", i)]
        rows.append(f'<tr><td>{esc(MAIN[i]["full"])}</td><td>{esc(model_main(i))}</td>'
                    f'<td class="n">{s:,}</td><td class="n"><a href="s{i:02d}.html">s{i:02d}</a></td></tr>')
    rows.append('<tr class="grp"><td colspan="4">外傳二十帖（番外）</td></tr>')
    for i in range(1, 21):
        s = stats[("o", i)]
        rows.append(f'<tr><td>{esc(SIDE[i]["full"])}</td><td>{esc(model_side(i))}</td>'
                    f'<td class="n">{s:,}</td><td class="n"><a href="o{i:02d}.html">o{i:02d}</a></td></tr>')
    table = "\n".join(rows)
    total = sum(stats.values())

    return f"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="{SERIES}：主線十帖與外傳二十帖，AI 語言模型輔助創作的故事系列">
<title>{SERIES}｜總覽</title>
{FONT_LINKS}
<style>{CSS_INDEX}</style>
</head>
<body>
<header class="hero">
{f'<img class="banner" src="images/banner.png" alt="{esc(SERIES)} 橫幅">' if exists_img("banner.png") else ''}
<div class="hero-text">
<h1>{esc(SERIES)}</h1>
<p class="sub">主線十帖・外傳二十帖｜島嶼、茶、可樂與重量訓練的故事</p>
</div>
</header>
<main class="wrap">
<section id="main">
<h2 class="sec">主線十帖</h2>
<div class="grid">
{cards_main}
</div>
</section>
<section id="side">
<h2 class="sec">外傳二十帖</h2>
<div class="grid">
{cards_side}
</div>
</section>
<section id="colophon">
<h2 class="sec">模型歸屬表・字數統計</h2>
<p class="note">各篇由不同 AI 語言模型輔助創作，以下以中性編號「模型 01～模型 30」標示；字數為 CJK 漢字統計。</p>
<table>
<thead><tr><th>篇名</th><th>執筆模型</th><th class="n">CJK 字數</th><th>頁面</th></tr></thead>
<tbody>
{table}
</tbody>
</table>
<p class="total">總計：{total:,} 字（主線＋外傳）</p>
</section>
</main>
<footer>
<p>{esc(SERIES)}｜本系列由 AI 語言模型輔助創作</p>
<p class="ver">{VERSION}</p>
</footer>
</body>
</html>
"""

# ---------------- 產生 ----------------
def write(fname, content):
    with open(os.path.join(DOCS, fname), "w", encoding="utf-8") as f:
        f.write(content)

def main():
    os.makedirs(DOCS, exist_ok=True)
    stats = {}
    # 主線 s01–s10
    for i in range(1, 11):
        body = read_body(os.path.join(STORIES, f"{i:02d}.md"))
        stats[("s", i)] = cjk_count(body)
        prev = (f"s{i-1:02d}.html", MAIN[i-1]["full"]) if i > 1 else None
        nxt = (f"s{i+1:02d}.html", MAIN[i+1]["full"]) if i < 10 else None
        write(f"s{i:02d}.html", read_page(f"s{i:02d}.html", MAIN[i]["full"],
              MAIN[i]["label"], MAIN[i]["name"], MAIN[i]["region"], model_main(i),
              f"cover-{i:02d}.png", body, prev, nxt))
    # 外傳 o01–o20
    for i in range(1, 21):
        body = read_body(os.path.join(STORIES_O, f"{i:02d}.md"))
        stats[("o", i)] = cjk_count(body)
        prev = (f"o{i-1:02d}.html", SIDE[i-1]["full"]) if i > 1 else None
        nxt = (f"o{i+1:02d}.html", SIDE[i+1]["full"]) if i < 20 else None
        write(f"o{i:02d}.html", read_page(f"o{i:02d}.html", SIDE[i]["full"],
              SIDE[i]["label"], SIDE[i]["name"], "", model_side(i),
              f"cover-o{i:02d}.png", body, prev, nxt))
    # 總覽
    write("index.html", build_index(stats))
    print("pages written:", len(os.listdir(DOCS)))

if __name__ == "__main__":
    sys.exit(main())
