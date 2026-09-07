"""Optional PDF text/metadata/geometry checks and page renders; requires PyMuPDF."""

import json
import re
import unicodedata
from html.parser import HTMLParser
from pathlib import Path

import pymupdf


def normalized(value):
    value = unicodedata.normalize("NFKC", value).replace("\u00ad", "")
    return re.sub(r"\s+", " ", value).strip()


class ArticleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.active = []
        self.blocks = []

    def handle_starttag(self, tag, attrs):
        if tag in {"h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "pre", "td", "th"}:
            self.active.append((tag, []))

    def handle_data(self, data):
        for _, parts in self.active:
            parts.append(data)

    def handle_endtag(self, tag):
        if self.active and self.active[-1][0] == tag:
            _, parts = self.active.pop()
            text = normalized("".join(parts))
            if text:
                self.blocks.append(text)


def page_text(page):
    text = page.get_text(sort=True)
    return re.sub(r"(?:Page|Página) \d+ (?:of|de) \d+\s*$", "", text)


def check_metadata(pdf, record):
    assert pdf.metadata["title"] == record["title"], "Title mismatch"
    assert pdf.metadata["author"] == record["author"], "Author mismatch"
    assert pdf.xref_get_key(pdf.pdf_catalog(), "Lang")[1] == record["locale"], "Language mismatch"
    for field, key in [("creationDate", "date"), ("modDate", "updatedAt")]:
        expected = "D:" + record[key][:10].replace("-", "")
        assert pdf.metadata[field].startswith(expected), f"{field} mismatch"
    links = [link.get("uri") for page in pdf for link in page.get_links()]
    assert record["sourceUrl"] in links, "Missing clickable source article"


def check_pages(pdf, output):
    for index, page in enumerate(pdf):
        for word in page.get_text("words"):
            box = pymupdf.Rect(word[:4])
            assert page.rect.contains(box), f"Text outside page {index + 1}: {word[4]}"
        footer = re.search(r"(?:Page|Página) (\d+) (?:of|de) (\d+)", page.get_text())
        assert footer and tuple(map(int, footer.groups())) == (index + 1, len(pdf)), "Bad pagination"
        page.get_pixmap(dpi=110, alpha=False).save(output / f"page-{index + 1:02}.png")


def validate(record, review_dir):
    output = review_dir / Path(record["preview"]).stem
    output.mkdir(exist_ok=True)
    parser = ArticleText()
    parser.feed((review_dir / record["preview"]).read_text())
    with pymupdf.open(record["pdf"]) as pdf:
        assert len(pdf) > 0 and not pdf.needs_pass, "PDF cannot be opened"
        check_metadata(pdf, record)
        text = normalized("\n".join(page_text(page) for page in pdf))
        for block in parser.blocks:
            assert block in text, f"Missing or altered article text: {block[:140]}"
        check_pages(pdf, output)
        (output / "article.txt").write_text("\n".join(page_text(page) for page in pdf))
        print(f"PASS {record['pdf']}: {len(pdf)} pages, {len(parser.blocks)} complete text blocks, metadata, links, glyph text, bounds and page numbers; PNGs in {output}")


if __name__ == "__main__":
    review_dir = Path("output/playwright/blog-pdf/review")
    for record in json.loads((review_dir / "documents.json").read_text()):
        validate(record, review_dir)
