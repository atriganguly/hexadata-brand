"""HexaData brand for Python: tokens, chart themes and (when installed from a release) the official logo and font files.

    from hexadata_brand import PALETTE, SEMANTIC, TAGLINES
    from hexadata_brand.charts import matplotlib_rc, plotly_template

Use the semantic roles (``SEMANTIC["light"]["fg"]``), not raw palette values, for text and surfaces: roles are the
contrast-checked pairings. The HexaData logos, name and taglines are trademarks of Esconet Technologies Limited
(see BRAND-LICENSE.md); the software is Apache-2.0.
"""

from pathlib import Path

from .tokens import (  # noqa: F401  (re-exported)
    BRAND_REVISION,
    BRAND_SOURCE,
    DESCRIPTOR,
    FONT_SIZE_PX,
    FONTS,
    LOGOS,
    ORIGIN,
    PALETTE,
    RADIUS_PX,
    SEMANTIC,
    SPACE_PX,
    TAGLINES,
    VERSION,
)

__version__ = VERSION
ASSETS = Path(__file__).parent / "assets"


def logo_path(logo_id: str, size: int = 256) -> Path:
    """Path to a logo file shipped in the wheel (release builds). Icons are published at 64/128/256/512/1024 px."""
    known = {logo["id"]: logo for logo in LOGOS}
    if logo_id not in known:
        raise KeyError(f"unknown logo id {logo_id!r}; choose one of {sorted(known)}")
    name = f"{logo_id}-{size}.png" if known[logo_id]["form"] == "icon" else f"{logo_id}.png"
    path = ASSETS / "logo" / name
    if not path.exists():
        raise FileNotFoundError(f"{path} is not bundled in this install; use a release wheel or download it from {ORIGIN}/v2/logo/{name}")
    return path


def font_path(filename: str) -> Path:
    """Path to an official static TTF (e.g. 'SpaceGrotesk-Bold.ttf') shipped in release wheels."""
    path = ASSETS / "fonts" / filename
    if not path.exists():
        raise FileNotFoundError(f"{path} is not bundled in this install; download it from {ORIGIN}/v2/fonts/ttf/{filename}")
    return path
