import fitz


def parse_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    full_text = []
    for page in doc:
        text = page.get_text("text")
        full_text.append(text)

    doc.close()

    raw = "\n".join(full_text)

    lines = [line.strip() for line in raw.splitlines()]
    cleaned = "\n".join(line for line in lines if line)

    return cleaned