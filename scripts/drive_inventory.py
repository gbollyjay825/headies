#!/usr/bin/env python3
"""Build a gallery item manifest from public Google Drive folder pages.

Google Drive is being used here as a source library. Public folder pages embed
an initial listing in window['_DRIVE_ivd']; this script extracts that data,
recurses into folders, and writes a portable item manifest for the static site.
"""

from __future__ import annotations

import ast
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SOURCES_PATH = ROOT / "data" / "gallery-sources.json"
ITEMS_PATH = ROOT / "data" / "gallery-items.json"
SUMMARY_PATH = ROOT / "data" / "gallery-inventory-summary.json"

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
)

MEDIA_MIME_PREFIXES = ("image/", "video/")
FOLDER_MIME = "application/vnd.google-apps.folder"


def drive_folder_url(folder_id: str) -> str:
    return f"https://drive.google.com/drive/folders/{folder_id}?usp=sharing"


def image_url(file_id: str, width: int = 1600) -> str:
    return f"https://lh3.googleusercontent.com/d/{file_id}=w{width}"


def file_view_url(file_id: str) -> str:
    return f"https://drive.google.com/file/d/{file_id}/view"


def file_embed_url(file_id: str) -> str:
    return f"https://drive.google.com/file/d/{file_id}/preview"


def fetch_text(url: str) -> tuple[int | None, str, str | None]:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            body = res.read().decode("utf-8", errors="ignore")
            return res.status, body, res.geturl()
    except urllib.error.HTTPError as exc:
        try:
            body = exc.read().decode("utf-8", errors="ignore")
        except Exception:
            body = ""
        return exc.code, body, getattr(exc, "url", url)
    except urllib.error.URLError as exc:
        return None, "", str(exc.reason)


def extract_ivd(html: str) -> list[Any]:
    match = re.search(r"window\['_DRIVE_ivd'\]\s*=\s*'((?:\\.|[^'])*)'", html)
    if not match:
        return []
    decoded = ast.literal_eval("'" + match.group(1) + "'")
    return json.loads(decoded)


def parse_entries(html: str) -> list[list[Any]]:
    data = extract_ivd(html)
    if not data or not isinstance(data, list) or not data[0]:
        return []
    entries = data[0]
    if not isinstance(entries, list):
        return []
    return [entry for entry in entries if isinstance(entry, list) and len(entry) >= 4]


def slug(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "item"


def item_from_entry(entry: list[Any], collection: dict[str, Any], depth: int) -> dict[str, Any] | None:
    file_id, name, mime_type = entry[0], entry[2], entry[3]
    if not isinstance(file_id, str) or not isinstance(name, str) or not isinstance(mime_type, str):
        return None
    if not mime_type.startswith(MEDIA_MIME_PREFIXES):
        return None

    media_type = "video" if mime_type.startswith("video/") else "image"
    size = entry[13] if len(entry) > 13 and isinstance(entry[13], int) else None
    modified_ms = entry[9] if len(entry) > 9 and isinstance(entry[9], int) else None
    captured_ms = entry[10] if len(entry) > 10 and isinstance(entry[10], int) else None
    item_id = f"{collection['id']}-{slug(Path(name).stem)}-{file_id[-6:].lower()}"

    item: dict[str, Any] = {
        "id": item_id,
        "driveFileId": file_id,
        "title": Path(name).stem.replace("_", " ").replace("-", " ").strip(),
        "fileName": name,
        "mimeType": mime_type,
        "type": media_type,
        "collection": collection["id"],
        "collectionTitle": collection["title"],
        "event": collection.get("event"),
        "year": collection.get("year"),
        "sourceFolderId": collection["folderId"],
        "depth": depth,
        "sizeBytes": size,
        "modifiedAt": ms_to_iso(modified_ms),
        "capturedAt": ms_to_iso(captured_ms),
        "viewUrl": file_view_url(file_id),
        "embedUrl": file_embed_url(file_id),
    }
    if media_type == "image":
        item.update(
            {
                "thumbUrl": image_url(file_id, 900),
                "imageUrl": image_url(file_id, 1600),
                "fullUrl": image_url(file_id, 2200),
            }
        )
    return item


def ms_to_iso(value: int | None) -> str | None:
    if not value:
        return None
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(value / 1000))


def folder_collection(base: dict[str, Any], entry: list[Any]) -> dict[str, Any] | None:
    file_id, name, mime_type = entry[0], entry[2], entry[3]
    if not isinstance(file_id, str) or not isinstance(name, str) or mime_type != FOLDER_MIME:
        return None
    return {
        **base,
        "id": f"{base['id']}--{slug(name)}",
        "title": f"{base['title']} / {name}",
        "folderId": file_id,
        "parentCollection": base["id"],
    }


def walk_folder(
    collection: dict[str, Any],
    items: list[dict[str, Any]],
    folders_seen: set[str],
    folder_reports: list[dict[str, Any]],
    depth: int = 0,
    max_depth: int = 2,
) -> None:
    folder_id = collection["folderId"]
    if folder_id in folders_seen:
        return
    folders_seen.add(folder_id)

    status, html, final_url = fetch_text(drive_folder_url(folder_id))
    entries = parse_entries(html)
    folder_reports.append(
        {
            "collection": collection["id"],
            "title": collection["title"],
            "folderId": folder_id,
            "status": status,
            "finalUrl": final_url,
            "entriesFound": len(entries),
            "depth": depth,
        }
    )

    for entry in entries:
        item = item_from_entry(entry, collection, depth)
        if item:
            items.append(item)

    if depth >= max_depth:
        return

    for entry in entries:
        child = folder_collection(collection, entry)
        if child:
            walk_folder(child, items, folders_seen, folder_reports, depth + 1, max_depth)


def main() -> int:
    sources = json.loads(SOURCES_PATH.read_text())
    items: list[dict[str, Any]] = []
    folder_reports: list[dict[str, Any]] = []
    folders_seen: set[str] = set()

    for collection in sources["collections"]:
        if collection.get("accessCheck") not in {"200", 200}:
            folder_reports.append(
                {
                    "collection": collection["id"],
                    "title": collection["title"],
                    "folderId": collection["folderId"],
                    "status": collection.get("accessCheck"),
                    "entriesFound": 0,
                    "skipped": True,
                    "actionNeeded": collection.get("actionNeeded"),
                }
            )
            continue
        walk_folder(collection, items, folders_seen, folder_reports)

    unique_items: dict[str, dict[str, Any]] = {}
    for item in items:
        unique_items[item["driveFileId"]] = item

    ordered = sorted(
        unique_items.values(),
        key=lambda item: (
            str(item.get("collection") or ""),
            str(item.get("fileName") or ""),
            str(item.get("driveFileId") or ""),
        ),
    )

    manifest = {
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "source": "Google Drive public folder HTML inventory",
        "limitations": [
            "Google Drive folder pages expose an initial listing; very large folders may require further pagination or authenticated export for complete inventory.",
            "Drive is being used as a source library and temporary delivery path, not a dedicated production CDN.",
        ],
        "items": ordered,
    }
    summary = {
        "updatedAt": manifest["updatedAt"],
        "totalItems": len(ordered),
        "imageItems": sum(1 for item in ordered if item["type"] == "image"),
        "videoItems": sum(1 for item in ordered if item["type"] == "video"),
        "foldersVisited": len(folders_seen),
        "folders": folder_reports,
    }

    ITEMS_PATH.write_text(json.dumps(manifest, indent=2) + "\n")
    SUMMARY_PATH.write_text(json.dumps(summary, indent=2) + "\n")
    print(f"Wrote {len(ordered)} media items from {len(folders_seen)} folders.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
