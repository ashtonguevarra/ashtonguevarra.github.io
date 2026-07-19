#!/usr/bin/env python3
"""Generate 3D ASCII art for any text using the 3D-ASCII block font style."""

import sys

# 3D-ASCII font definitions (all 10-char wide, 8 lines deep)
# Based on the patorjk.com 3D-ASCII FIGlet font

FONT = {}

# ---- UPPERCASE ----
FONT['L'] = [
    "   ______  ",
    "  / ____/  ",
    " / /       ",
    "/ /        ",
    "/_/        ",
    "           ",
    "           ",
    "           ",
]

FONT['E'] = [
    "   ________",
    "  / ____/ /",
    " / /   / / ",
    "/ /___/ /  ",
    "\\____/_/   ",
    "           ",
    "           ",
    "           ",
]

FONT['T'] = [
    "   ______  ",
    "  / ____/  ",
    " / /___    ",
    "/ ____/    ",
    "/_/        ",
    "  / /      ",
    " /_/       ",
    "           ",
]

# ---- LOWERCASE ----
FONT['a'] = [
    "    ____   ",
    "   / __ \\ ",
    "  / /_/ / ",
    " / ____/  ",
    "/_/       ",
    "          ",
    "          ",
    "          ",
]

FONT['b'] = [
    "   ______  ",
    "  / ____/  ",
    " / /___    ",
    "/ ____/    ",
    "/_/        ",
    "           ",
    "           ",
    "           ",
]

FONT['e'] = [
    "   ________",
    "  / ____/ /",
    " / /   / / ",
    "/ /___/ /  ",
    "\\____/_/   ",
    "           ",
    "           ",
    "           ",
]

FONT['g'] = [
    "   ________ ",
    "  /  _/ __ \\",
    " /  / / / / ",
    "/ /_/ /_/ / ",
    "\\____\\____/ ",
    "            ",
    "            ",
    "            ",
]

FONT['k'] = [
    "   ______  ",
    "  / ____/  ",
    " / /___    ",
    "/ ____/    ",
    "/_/        ",
    "   / /     ",
    "  /_/      ",
    "           ",
]

FONT['l'] = [
    "   ______  ",
    "  / ____/  ",
    " / /       ",
    "/ /        ",
    "/_/        ",
    "           ",
    "           ",
    "           ",
]

FONT['o'] = [
    "    ____   ",
    "   / __ \\ ",
    "  / /_/ / ",
    " / ____/  ",
    "/_/       ",
    "          ",
    "          ",
    "          ",
]

FONT['p'] = [
    "   ______  ",
    "  / ____/  ",
    " / / __    ",
    "/ /_/ /    ",
    "\\____/     ",
    "           ",
    "           ",
    "           ",
]

FONT['r'] = [
    "   ______  ",
    "  / ____/  ",
    " / / __    ",
    "/ /_/ /    ",
    "\\____/_    ",
    "    / /    ",
    "   /_/     ",
    "           ",
]

FONT['s'] = [
    "   ________  ",
    "  /  _/ __ \\ ",
    "  / // / / / ",
    " / // /_/ /  ",
    "/___/\\____/  ",
    "             ",
    "             ",
    "             ",
]

FONT['t'] = [
    "   ______  ",
    "  / ____/  ",
    " / /___    ",
    "/ ____/    ",
    "/_/        ",
    "   / /     ",
    "  /_/      ",
    "           ",
]

FONT['y'] = [
    "   __  __  ",
    "  / / / /  ",
    " / / / /   ",
    "/ /_/ /    ",
    "\\____/     ",
    "  / /      ",
    " /_/       ",
    "           ",
]

# ---- PUNCTUATION ----
FONT["'"] = [
    "    __     ",
    "   / /     ",
    "  /_/      ",
    "           ",
    "           ",
    "           ",
    "           ",
    "           ",
]

FONT['!'] = [
    "    __     ",
    "   / /     ",
    "  / /      ",
    " / /       ",
    " \\_/       ",
    "           ",
    "   /       ",
    "  /_       ",
]

# ---- SPACE ----
FONT[' '] = [
    "          ",
    "          ",
    "          ",
    "          ",
    "          ",
    "          ",
    "          ",
    "          ",
]


def generate_ascii(text):
    """Generate 3D-ASCII art for the given text."""
    max_lines = 8
    lines = []
    
    for i in range(max_lines):
        line = ""
        for char in text:
            if char in FONT:
                letter_lines = FONT[char]
                if i < len(letter_lines):
                    line += letter_lines[i].rstrip() + "  "
                else:
                    line += " " * 10 + "  "
            else:
                line += " " * 10 + "  "
        lines.append(line.rstrip())
    
    return "\n".join(lines)


if __name__ == "__main__":
    text = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "yapper blogs"
    result = generate_ascii(text)
    print(result)