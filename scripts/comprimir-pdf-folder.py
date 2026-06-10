"""Recomprime imagens de um PDF in-place (pikepdf + Pillow).

Varre TODOS os XObjects de imagem (inclusive aninhados em Forms),
reamostra para no máximo LARGURA_MAX px e re-encoda como JPEG.
SMasks (referenciadas via /SMask) são reamostradas em Flate cinza;
máscara totalmente opaca é descartada. Texto vetorial não é tocado.

Uso: python3 comprimir.py entrada.pdf saida.pdf [largura_max] [qualidade]
"""

import io
import sys
import zlib

import pikepdf
from pikepdf import Name, PdfImage
from PIL import Image

LARGURA_MAX = int(sys.argv[3]) if len(sys.argv) > 3 else 1240
QUALIDADE = int(sys.argv[4]) if len(sys.argv) > 4 else 78
MIN_BYTES = 40 * 1024  # imagens menores que isto não valem o risco


def processar(caminho_in: str, caminho_out: str) -> None:
    pdf = pikepdf.open(caminho_in)

    imagens = []
    smask_de = {}  # objgen da smask -> objgen do dono
    for obj in pdf.objects:
        try:
            if not (isinstance(obj, pikepdf.Stream) and str(obj.get("/Subtype")) == "/Image"):
                continue
        except Exception:
            continue
        imagens.append(obj)
        sm = obj.get("/SMask")
        if sm is not None:
            smask_de[sm.objgen] = obj.objgen

    antes = depois = mudadas = 0
    for obj in imagens:
        if obj.objgen in smask_de:
            continue  # smask é tratada junto com a imagem dona

        raw = len(obj.read_raw_bytes())
        smask = obj.get("/SMask")
        if raw < MIN_BYTES and (smask is None or len(smask.read_raw_bytes()) < MIN_BYTES) and int(obj.Width) <= LARGURA_MAX:
            continue

        try:
            pil = PdfImage(obj).as_pil_image()
        except Exception as e:
            print(f"  ! pulando {obj.objgen}: {e}")
            continue

        antes += raw
        if pil.width > LARGURA_MAX:
            pil = pil.resize((LARGURA_MAX, round(pil.height * LARGURA_MAX / pil.width)), Image.LANCZOS)
        if pil.mode != "RGB":
            pil = pil.convert("RGB")

        buf = io.BytesIO()
        pil.save(buf, "JPEG", quality=QUALIDADE, optimize=True)
        obj.write(buf.getvalue(), filter=Name.DCTDecode)
        obj.Width, obj.Height = pil.width, pil.height
        obj.ColorSpace = Name.DeviceRGB
        obj.BitsPerComponent = 8
        for k in ("/DecodeParms", "/Decode", "/Intent"):
            if k in obj:
                del obj[k]

        if smask is not None:
            antes += len(smask.read_raw_bytes())
            try:
                alpha = PdfImage(smask).as_pil_image().convert("L")
            except Exception:
                alpha = None
            if alpha is not None and alpha.getextrema()[0] >= 250:
                del obj.SMask  # totalmente opaca — fora
            elif alpha is not None:
                alpha = alpha.resize((pil.width, pil.height), Image.LANCZOS)
                smask.write(zlib.compress(alpha.tobytes(), 9), filter=Name.FlateDecode)
                smask.Width, smask.Height = alpha.width, alpha.height
                smask.BitsPerComponent = 8
                smask.ColorSpace = Name.DeviceGray
                for k in ("/DecodeParms", "/Decode"):
                    if k in smask:
                        del smask[k]
                depois += len(smask.read_raw_bytes())

        depois += len(obj.read_raw_bytes())
        mudadas += 1

    pdf.save(caminho_out, compress_streams=True,
             object_stream_mode=pikepdf.ObjectStreamMode.generate)
    print(f"  imagens: {antes // 1024}K → {depois // 1024}K · {mudadas} recomprimidas")


if __name__ == "__main__":
    processar(sys.argv[1], sys.argv[2])
