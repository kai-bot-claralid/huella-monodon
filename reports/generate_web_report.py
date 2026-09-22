from pathlib import Path
from tempfile import NamedTemporaryFile
import hashlib

from PIL import Image
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfdoc
from reportlab.lib import utils as rl_utils

# Compatibilidad con la versión de OpenSSL/Python disponible en el servidor.
pdfdoc.md5 = lambda *args, **kwargs: hashlib.md5(*args)
rl_utils.md5 = lambda *args, **kwargs: hashlib.md5(*args)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "reports" / "Reporte_Labores_Micrositio_Proyecto_Monodon_Agosto_2026.pdf"
CAPTURES = Path("/tmp/monodon-report-captures")

NAVY = HexColor("#07364C")
DEEP = HexColor("#052D40")
TEAL = HexColor("#168A91")
CORAL = HexColor("#FF6F59")
CREAM = HexColor("#F6F1E8")
INK = HexColor("#173743")
MUTED = HexColor("#587079")
LINE = HexColor("#D8DED9")
PALE = HexColor("#E8F1EE")

W, H = A4
M = 42


def register_fonts():
    pdfmetrics.registerFont(TTFont("Body", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
    pdfmetrics.registerFont(TTFont("Body-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Display", "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"))


def round_rect(c, x, y, w, h, r, fill, stroke=None, width=1):
    c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.setLineWidth(width)
        c.roundRect(x, y, w, h, r, fill=1, stroke=1)
    else:
        c.roundRect(x, y, w, h, r, fill=1, stroke=0)


def text(c, value, x, y, size=9, color=INK, font="Body"):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x, y, value)


def text_fit(c, value, x, y, max_width, size=9, min_size=5.5, color=INK, font="Body", align="left"):
    """Reduce el texto hasta que quede completamente dentro del ancho disponible."""
    fitted = size
    while fitted > min_size and c.stringWidth(value, font, fitted) > max_width:
        fitted -= 0.25
    c.setFont(font, fitted)
    c.setFillColor(color)
    if align == "center":
        c.drawCentredString(x + max_width / 2, y, value)
    elif align == "right":
        c.drawRightString(x + max_width, y, value)
    else:
        c.drawString(x, y, value)


def wrapped(c, value, x, y, max_width, size=8, leading=10, color=INK, font="Body", max_lines=4):
    words = value.split()
    lines, current = [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if c.stringWidth(trial, font, size) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    lines = lines[:max_lines]
    for i, line in enumerate(lines):
        text(c, line, x, y - i * leading, size, color, font)
    return y - len(lines) * leading


def draw_cover(c, image_path, x, y, w, h, radius=0, focus_y=0.5):
    img = Image.open(image_path).convert("RGB")
    iw, ih = img.size
    target_ratio = w / h
    current_ratio = iw / ih
    if current_ratio > target_ratio:
        nw = int(ih * target_ratio)
        left = max(0, min(iw - nw, (iw - nw) // 2))
        box = (left, 0, left + nw, ih)
    else:
        nh = int(iw / target_ratio)
        top = int((ih - nh) * focus_y)
        top = max(0, min(ih - nh, top))
        box = (0, top, iw, top + nh)
    cropped = img.crop(box)
    with NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        temp_path = Path(tmp.name)
    cropped.save(temp_path, quality=92)
    c.saveState()
    if radius:
        p = c.beginPath()
        p.roundRect(x, y, w, h, radius)
        c.clipPath(p, stroke=0, fill=0)
    c.drawImage(str(temp_path), x, y, w, h, mask="auto")
    c.restoreState()
    temp_path.unlink(missing_ok=True)


def footer(c, page):
    c.setStrokeColor(HexColor("#CBD5D2"))
    c.line(M, 29, W - M, 29)
    text(c, "UNPHU · VICERRECTORÍA DE PROYECTOS DE INVESTIGACIÓN", M, 17, 6.5, MUTED, "Body-Bold")
    text(c, f"PROYECTO MONODON  ·  {page:02d}", W - M - 104, 17, 6.5, MUTED, "Body-Bold")


def page_one(c):
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    c.setFillColor(NAVY)
    c.rect(0, H - 178, W, 178, fill=1, stroke=0)
    c.setFillColor(CORAL)
    c.rect(0, H - 178, 9, 178, fill=1, stroke=0)
    text(c, "PROYECTO", M, H - 47, 8, HexColor("#79D2D1"), "Body-Bold")
    text(c, "MONODON", M, H - 77, 26, white, "Display")
    wrapped(
        c,
        "Distribución y potencial reproductivo de Penaeus monodon en Samaná: hacia una pesquería de control de esta especie invasora.",
        M,
        H - 103,
        340,
        8.5,
        12,
        white,
        "Body",
        4,
    )
    round_rect(c, W - M - 108, H - 102, 108, 58, 8, HexColor("#0D5268"), HexColor("#347A89"))
    text(c, "REPORTE DE LABORES", W - M - 96, H - 66, 6.5, HexColor("#8ED8D3"), "Body-Bold")
    text_fit(c, "MICROSITIO WEB", W - M - 96, H - 83, 84, 11, 8, white, "Body-Bold")
    text(c, "AGOSTO 2026", W - M - 96, H - 96, 7, white, "Body")

    y = H - 202
    text(c, "INFORMACIÓN GENERAL", M, y, 7, TEAL, "Body-Bold")
    c.setStrokeColor(LINE)
    c.line(M, y - 8, W - M, y - 8)
    info = [
        ("RESPONSABLE", "Cindy Guzmán"),
        ("CÓDIGO", "10848"),
        ("ROL", "Coordinadora de Contenido y Publicaciones"),
        ("DEPENDENCIA", "Vicerrectoría de Proyectos de Investigación"),
        ("CORREO", "cguzman@unphu.edu.do"),
        ("PUBLICACIÓN", "proyecto.monodon.workers.dev"),
    ]
    base_y = y - 28
    col_w = (W - 2 * M) / 2
    for i, (label, value) in enumerate(info):
        col, row = i % 2, i // 2
        xx, yy = M + col * col_w, base_y - row * 37
        text(c, label, xx, yy, 6.2, MUTED, "Body-Bold")
        text_fit(c, value, xx, yy - 13, col_w - 18, 8.2, 6.5, INK, "Body-Bold" if label == "PUBLICACIÓN" else "Body")

    y2 = base_y - 3 * 37 - 7
    text(c, "LABORES REALIZADAS", M, y2, 8, TEAL, "Body-Bold")
    c.setStrokeColor(LINE)
    c.line(M, y2 - 9, W - M, y2 - 9)

    rows = [
        ("01", "Planificación y arquitectura", "Definición de estructura, navegación, jerarquía y recorrido del micrositio.", "Estrategia digital"),
        ("02", "Diseño y desarrollo responsive", "Construcción de la interfaz y adaptación para computadoras, tabletas y móviles.", "Diseño web"),
        ("03", "Comunicación científica", "Redacción, síntesis y organización de los contenidos del proyecto para público general.", "Contenido"),
        ("04", "Integración de recursos", "Incorporación de fotografías, mapa del área de estudio y comparación visual de especies.", "Curaduría visual"),
        ("05", "Información institucional", "Presentación del título oficial, equipo investigador, instituciones y datos de contacto.", "Comunicación"),
        ("06", "Publicación y verificación", "Despliegue en GitHub Pages y Cloudflare Workers, revisión funcional y control de calidad.", "Implementación"),
    ]
    table_top = y2 - 23
    row_h = 52
    for i, (num, title, desc, cat) in enumerate(rows):
        yy = table_top - i * row_h
        if i % 2 == 0:
            c.setFillColor(HexColor("#F0EEE8"))
            c.rect(M, yy - row_h + 4, W - 2 * M, row_h - 3, fill=1, stroke=0)
        round_rect(c, M + 4, yy - 32, 25, 25, 12.5, CORAL if i in (0, 5) else TEAL)
        text(c, num, M + 11, yy - 24, 7.5, white, "Body-Bold")
        text(c, title, M + 42, yy - 14, 8.2, INK, "Body-Bold")
        wrapped(c, desc, M + 42, yy - 28, 315, 6.8, 9, MUTED, "Body", 2)
        round_rect(c, W - M - 92, yy - 31, 86, 20, 10, PALE)
        text_fit(c, cat.upper(), W - M - 88, yy - 24, 78, 5.7, 5, TEAL, "Body-Bold", "center")

    metrics_y = 76
    round_rect(c, M, metrics_y, W - 2 * M, 66, 9, NAVY)
    metrics = [("1", "MICROSITIO DESARROLLADO"), ("6", "LABORES DOCUMENTADAS"), ("2", "PLATAFORMAS DE PUBLICACIÓN")]
    mw = (W - 2 * M) / 3
    for i, (value, label) in enumerate(metrics):
        xx = M + i * mw
        if i:
            c.setStrokeColor(HexColor("#3B6877"))
            c.line(xx, metrics_y + 13, xx, metrics_y + 53)
        c.setFont("Display", 20)
        c.setFillColor(white)
        c.drawCentredString(xx + mw / 2, metrics_y + 33, value)
        text_fit(c, label, xx + 10, metrics_y + 19, mw - 20, 5.7, 4.8, HexColor("#9ED4D2"), "Body-Bold", "center")
    footer(c, 1)


def gallery_card(c, image_name, x, y, w, h, number, title, caption, focus_y=0.5):
    round_rect(c, x + 4, y - 4, w, h, 8, HexColor("#DCE5E1"))
    draw_cover(c, CAPTURES / image_name, x, y, w, h, 8, focus_y)
    c.setFillColor(DEEP)
    c.roundRect(x + 8, y + 8, w - 16, 35, 5, fill=1, stroke=0)
    round_rect(c, x + 14, y + 16, 22, 18, 9, CORAL)
    text(c, number, x + 20, y + 22, 6.2, white, "Body-Bold")
    text(c, title, x + 43, y + 27, 7.2, white, "Body-Bold")
    text(c, caption, x + 43, y + 16, 5.7, HexColor("#C7E4E2"), "Body")


def page_two(c):
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, H - 104, W, 104, fill=1, stroke=0)
    c.setFillColor(CORAL)
    c.rect(M, H - 81, 34, 4, fill=1, stroke=0)
    text_fit(c, "EVIDENCIA DEL TRABAJO REALIZADO", M, H - 50, 370, 18, 14, white, "Display")
    text(c, "Micrositio web del Proyecto Monodon", M, H - 69, 8, HexColor("#B7D9D6"), "Body")
    text(c, "PROYECTO MONODON", W - M - 92, H - 51, 7, HexColor("#7FD1CD"), "Body-Bold")
    text(c, "AGOSTO 2026", W - M - 92, H - 66, 7, white, "Body")

    text(c, "CAPTURA DE PANTALLA", M, 702, 7, TEAL, "Body-Bold")
    c.setStrokeColor(LINE)
    c.line(M, 693, W - M, 693)

    round_rect(c, M + 5, 371, W - 2 * M, 290, 10, HexColor("#DCE5E1"))
    draw_cover(c, CAPTURES / "hero-final.png", M, 377, W - 2 * M, 290, 10, 0.35)

    round_rect(c, M, 242, W - 2 * M, 95, 9, NAVY)
    text(c, "MICROSITIO PUBLICADO", M + 22, 311, 7, HexColor("#8ED8D3"), "Body-Bold")
    text(c, "Proyecto Monodon", M + 22, 287, 17, white, "Display")
    text_fit(c, "https://proyecto.monodon.workers.dev/", M + 22, 263, 340, 10, 7, white, "Body-Bold")
    round_rect(c, W - M - 102, 269, 82, 31, 15, CORAL)
    text_fit(c, "SITIO EN LÍNEA", W - M - 95, 281, 68, 6.5, 5.5, white, "Body-Bold", "center")

    text(c, "DESCRIPCIÓN DE LA EVIDENCIA", M, 205, 7, TEAL, "Body-Bold")
    c.setStrokeColor(LINE)
    c.line(M, 196, W - M, 196)
    wrapped(
        c,
        "Captura de la página principal del micrositio desarrollado para comunicar el propósito, alcance, metodología, resultados, equipo e instituciones participantes del Proyecto Monodon.",
        M,
        174,
        W - 2 * M,
        9,
        14,
        INK,
        "Body",
        4,
    )
    text(c, "Estado: publicado y disponible para consulta pública.", M, 110, 8, MUTED, "Body-Bold")
    footer(c, 2)


def build():
    register_fonts()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("Reporte de labores — Micrositio Proyecto Monodon")
    c.setAuthor("Cindy Guzmán — UNPHU")
    page_one(c)
    c.showPage()
    page_two(c)
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
