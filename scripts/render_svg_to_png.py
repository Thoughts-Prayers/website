#!/usr/bin/env python3
"""Render an SVG asset to PNG using resvg (via npx).

Usage:
  python scripts/render_svg_to_png.py input.svg output.png [--width 1200] [--height 630]

This script shells out to `npx @resvg/resvg-js`, so Node.js must be available
on the host machine. The `--yes` flag lets npx download the tool if it is not
already cached.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(description="Convert SVG artwork to PNG.")
  parser.add_argument("input", type=Path, help="Path to the source SVG file")
  parser.add_argument("output", type=Path, help="Destination PNG path")
  parser.add_argument("--width", type=int, default=None, help="Optional output width in pixels")
  parser.add_argument("--height", type=int, default=None, help="Optional output height in pixels")
  parser.add_argument(
      "--background",
      type=str,
      default=None,
      help="Optional background color override (e.g. '#FFFFFF').",
  )
  return parser.parse_args()


def ensure_tool_exists(tool: str) -> None:
  if shutil.which(tool) is None:
    sys.exit(f"Error: required tool '{tool}' was not found on PATH.")


def build_command(args: argparse.Namespace) -> list[str]:
  cmd = [
      "npx",
      "--yes",
      "@resvg/resvg-js",
      str(args.input),
      str(args.output),
      "--format",
      "png",
  ]

  if args.width is not None:
    cmd.extend(["--width", str(args.width)])
  if args.height is not None:
    cmd.extend(["--height", str(args.height)])
  if args.background is not None:
    cmd.extend(["--background", args.background])

  return cmd


def main() -> None:
  args = parse_args()
  ensure_tool_exists("npx")

  if not args.input.exists():
    sys.exit(f"Input SVG '{args.input}' does not exist.")

  args.output.parent.mkdir(parents=True, exist_ok=True)

  cmd = build_command(args)
  try:
    subprocess.run(cmd, check=True)
  except subprocess.CalledProcessError as exc:
    sys.exit(exc.returncode)

  print(f"Rendered {args.input} -> {args.output}")


if __name__ == "__main__":
  main()
