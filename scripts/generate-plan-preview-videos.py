#!/usr/bin/env python3
"""Generate short local plan previews from the approved editorial posters.

Requires FFmpeg with libx264. Override its location with FFMPEG=/path/to/ffmpeg.
The images are existing BAYONA campaign assets; this creates a subtle camera
push so the preview is a real, silent MP4 without introducing new claims.
"""

from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
POSTERS = {
    "raiz": "plan-raiz-poster-1600.webp",
    "fuerza": "plan-fuerza-poster-1600.webp",
    "rendimiento": "plan-rendimiento-poster-1600.webp",
    "elite": "plan-elite-poster-1600.webp",
}
POSTER_DIR = ROOT / "public/images/bayona-generated"
OUTPUT_DIR = ROOT / "public/videos/plan-atelier"


def ffmpeg_binary() -> str:
    configured = os.environ.get("FFMPEG")
    binary = configured or shutil.which("ffmpeg")
    if not binary or not Path(binary).is_file():
        raise SystemExit("FFmpeg no encontrado. Instálalo o define FFMPEG=/ruta/ffmpeg.")
    return binary


def main() -> None:
    ffmpeg = ffmpeg_binary()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for plan, poster_name in POSTERS.items():
        poster = POSTER_DIR / poster_name
        if not poster.is_file():
            raise SystemExit(f"Falta el póster editorial: {poster}")
        output = OUTPUT_DIR / f"plan-{plan}.mp4"
        command = [
            ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
            "-loop", "1", "-framerate", "25", "-i", str(poster),
            "-vf", (
                "scale=1600:1000:force_original_aspect_ratio=increase,"
                "crop=1600:1000,"
                "zoompan=z='min(zoom+0.00035,1.0525)':"
                "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
                "d=150:s=1280x800:fps=25,format=yuv420p"
            ),
            "-t", "6", "-an", "-c:v", "libx264", "-preset", "medium",
            "-crf", "24", "-movflags", "+faststart", str(output),
        ]
        subprocess.run(command, check=True)
        print(f"Creado: {output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
