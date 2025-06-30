# confession_image_generator.py
# HOW TO RUN (in GitHub Codespaces or Linux):
# --------------------------------------------------
# python -m venv venv
# source venv/bin/activate
# pip install pillow emoji
# python confession_image_generator.py

from PIL import Image, ImageDraw, ImageFont
import textwrap
import datetime
import os
import emoji
import re

# Configurable settings
colors = {
    "PlaceVanier": {"background": "#FFDAD5", "accent": "#D65A4E"},
    "TotemPark": {"background": "#DDEEDF", "accent": "#5C8C66"},
    "OrchardCommons": {"background": "#E8DFFB", "accent": "#7A5CA0"},
}

EMOJI_FOLDER = "emoji_images"  # Folder with emoji PNGs named like '1f602.png'
EMOJI_SIZE = 36


def split_text_and_emojis(text):
    pattern = emoji.get_emoji_regexp()
    return re.split(f'({pattern.pattern})', text)


def draw_text_with_emojis(draw, base_img, text, position, font, max_width):
    x, y = position
    space_width = draw.textlength(' ', font=font)
    words = split_text_and_emojis(text)
    line = []
    line_width = 0

    for word in words:
        if emoji.is_emoji(word):
            width = EMOJI_SIZE
        else:
            width = draw.textlength(word, font=font)

        if line_width + width > max_width:
            x_offset = x
            for token in line:
                if emoji.is_emoji(token):
                    code = '-'.join(f"{ord(c):x}" for c in token)
                    emoji_path = os.path.join(EMOJI_FOLDER, f"{code}.png")
                    if os.path.exists(emoji_path):
                        try:
                            emoji_img = Image.open(emoji_path).resize((EMOJI_SIZE, EMOJI_SIZE))
                            base_img.paste(emoji_img, (x_offset, y), emoji_img.convert("RGBA"))
                        except Exception:
                            pass  # Skip broken emoji image
                    x_offset += EMOJI_SIZE
                else:
                    draw.text((x_offset, y), token, font=font, fill="black")
                    x_offset += draw.textlength(token, font=font)
            y += EMOJI_SIZE + 8
            line = [word]
            line_width = width
        else:
            line.append(word)
            line_width += width

    x_offset = x
    for token in line:
        if emoji.is_emoji(token):
            code = '-'.join(f"{ord(c):x}" for c in token)
            emoji_path = os.path.join(EMOJI_FOLDER, f"{code}.png")
            if os.path.exists(emoji_path):
                try:
                    emoji_img = Image.open(emoji_path).resize((EMOJI_SIZE, EMOJI_SIZE))
                    base_img.paste(emoji_img, (x_offset, y), emoji_img.convert("RGBA"))
                except Exception:
                    pass
            x_offset += EMOJI_SIZE
        else:
            draw.text((x_offset, y), token, font=font, fill="black")
            x_offset += draw.textlength(token, font=font)


def generate_confession_image(residence, confession_text, submission_date, output_path):
    width, height = 1080, 1080

    font_path_bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    font_path_regular = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

    try:
        font_title = ImageFont.truetype(font_path_bold, 56)
        font_body = ImageFont.truetype(font_path_regular, 36)
        font_small = ImageFont.truetype(font_path_regular, 28)
    except:
        font_title = font_body = font_small = ImageFont.load_default()

    bg_color = colors[residence]["background"]
    accent = colors[residence]["accent"]

    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    top_box = (60, 60, width - 60, 480)
    draw.rectangle(top_box, fill="white")
    draw.rectangle((top_box[0], top_box[1], top_box[2], top_box[1] + 20), fill=accent)

    title_text = f"{residence.replace('TotemPark', 'Totem Park').replace('PlaceVanier', 'Place Vanier').replace('OrchardCommons', 'Orchard Commons')} Confessions"
    desc = "Treat this as an intrusive thought dump, or confess something you would never have the balls to say in person.\nAll confessions are anonymous."

    draw.text((top_box[0] + 20, top_box[1] + 40), title_text, font=font_title, fill="black")
    draw.text((top_box[0] + 20, top_box[1] + 120), textwrap.fill(desc, 50), font=font_body, fill="black")

    bottom_box = (60, 520, width - 60, height - 100)
    draw.rectangle(bottom_box, fill="white")

    draw.text((bottom_box[0] + 20, bottom_box[1] + 20), "Insert Confession Below", font=font_title, fill="black")

    draw_text_with_emojis(
        draw,
        img,
        confession_text,
        (bottom_box[0] + 20, bottom_box[1] + 100),
        font_body,
        max_width=bottom_box[2] - bottom_box[0] - 40
    )

    draw.text((width - 350, height - 50), f"Submitted {submission_date}", font=font_small, fill="black")

    img.save(output_path)
    print(f"Image saved to {output_path}")

if __name__ == "__main__":
    generate_confession_image(
        residence="TotemPark",
        confession_text="leopard hair 😭guy just proved their point 😭😭",
        submission_date="4/1/25, 12:39 PM",
        output_path="totem_confession_output.png"
    )
