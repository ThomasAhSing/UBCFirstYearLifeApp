import requests
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

EMOJI_FOLDER = "emoji_images"  # Folder for storing emojis if downloaded
EMOJI_SIZE = 36

# Function to remove emojis from the text (for rendering)
def remove_emojis_from_text(text):
    return emoji.replace_emoji(text, replace="")  # This removes all emojis

# Helper function to download and save emoji PNGs from Twemoji CDN
def download_emoji_image(emoji_code):
    url = f"https://twemoji.maxcdn.com/v/latest/72x72/{emoji_code}.png"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            image_path = os.path.join(EMOJI_FOLDER, f"{emoji_code}.png")
            with open(image_path, "wb") as img_file:
                img_file.write(response.content)
            return image_path
        else:
            print(f"Failed to download emoji: {emoji_code}, Status Code: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error downloading emoji {emoji_code}: {e}")
        return None

def split_text_and_emojis(text):
    pattern = emoji.get_emoji_regexp()
    return re.split(f'({pattern.pattern})', text)

# Function to draw a rounded rectangle (all corners rounded)
def draw_rounded_rectangle(draw, rect, radius, color):
    x1, y1, x2, y2 = rect
    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=color)
    draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=color)
    draw.pieslice([x1, y1, x1 + 2 * radius, y1 + 2 * radius], 180, 270, fill=color)
    draw.pieslice([x2 - 2 * radius, y1, x2, y1 + 2 * radius], 270, 360, fill=color)
    draw.pieslice([x1, y2 - 2 * radius, x1 + 2 * radius, y2], 90, 180, fill=color)
    draw.pieslice([x2 - 2 * radius, y2 - 2 * radius, x2, y2], 0, 90, fill=color)

# Function to draw a rectangle with rounded top corners
def draw_rectangle_rounded_top(draw, rect, radius, color):
    x1, y1, x2, y2 = rect
    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=color)
    draw.rectangle([x1, y1 + radius, x2, y2], fill=color)
    draw.pieslice([x1, y1, x1 + 2 * radius, y1 + 2 * radius], 180, 270, fill=color)
    draw.pieslice([x2 - 2 * radius, y1, x2, y1 + 2 * radius], 270, 360, fill=color)

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
                    else:
                        emoji_path = download_emoji_image(code)
                        if emoji_path and os.path.exists(emoji_path):
                            emoji_img = Image.open(emoji_path).resize((EMOJI_SIZE, EMOJI_SIZE))
                            base_img.paste(emoji_img, (x_offset, y), emoji_img.convert("RGBA"))
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
            
            if not os.path.exists(emoji_path):
                emoji_path = download_emoji_image(code)
            
            if emoji_path and os.path.exists(emoji_path):
                try:
                    emoji_img = Image.open(emoji_path).resize((EMOJI_SIZE, EMOJI_SIZE))
                    base_img.paste(emoji_img, (x_offset, y), emoji_img.convert("RGBA"))
                except Exception:
                    pass
            x_offset += EMOJI_SIZE
        else:
            draw.text((x_offset, y), token, font=font, fill="black")
            x_offset += draw.textlength(token, font=font)




def generate_confession_image(residence, confession_text, submission_date, output_path, remove_emojis=False):
    width, height = 1080, 1080

    font_path_regular = "../assets/fonts/Roboto-Regular.ttf"  # Update with actual path to Roboto font
    font_path_bold = "../assets/fonts/Roboto-Bold.ttf"  # Update with actual path to Roboto-Bold font
    font_path_italic = "../assets/fonts/Roboto-Italic.ttf"
    
    try:
        font_title = ImageFont.truetype(font_path_regular, 56)  # Regular font for title
        font_subtitle = ImageFont.truetype(font_path_regular, 40)  # Slightly larger subtitle
        font_body = ImageFont.truetype(font_path_regular, 36)
        font_small = ImageFont.truetype(font_path_regular, 28)
        font_italic = ImageFont.truetype(font_path_italic, 28)  # Italic font for "Submitted on"
    except:
        font_title = font_subtitle = font_body = font_small = font_italic = ImageFont.load_default()

    bg_color = colors[residence]["background"]
    accent = colors[residence]["accent"]

    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Draw rounded top box with accent (rounded green accent)
    top_box = (60, 60, width - 60, 400)
    draw_rounded_rectangle(draw, top_box, radius=30, color="white")
    # Rounded green accent on top (only top edge smooth)
    accent_box = (top_box[0], top_box[1], top_box[2], top_box[1] + 20)
    draw_rectangle_rounded_top(draw, accent_box, radius=10, color=accent)

    title_text = f"{residence.replace('TotemPark', 'Totem Park').replace('PlaceVanier', 'Place Vanier').replace('OrchardCommons', 'Orchard Commons')} Confessions"
    desc = "Treat this as an intrusive thought dump, or confess something you would never have the balls to say in person.\nAll confessions are anonymous."

    draw.text((top_box[0] + 20, top_box[1] + 40), title_text, font=font_title, fill="black")
    draw.text((top_box[0] + 20, top_box[1] + 120), textwrap.fill(desc, 50), font=font_body, fill="black")

    # Draw bottom box (no green accent on the bottom)
    bottom_box = (60, 440, width - 60, height - 100)
    draw_rounded_rectangle(draw, bottom_box, radius=30, color="white")

    draw.text((bottom_box[0] + 20, bottom_box[1] + 20), "Insert Confession Below", font=font_subtitle, fill="black")

    # Remove emojis if needed
    if remove_emojis:
        confession_text = remove_emojis_from_text(confession_text)

    draw_text_with_emojis(
        draw,
        img,
        confession_text,
        (bottom_box[0] + 20, bottom_box[1] + 100),
        font_body,
        max_width=bottom_box[2] - bottom_box[0] - 40
    )

    # Make the "Submitted on" text italic and gray
    gray = (128, 128, 128)  # Gray color
    draw.text((width - 350, height - 50), f"Submitted {submission_date}", font=font_italic, fill='#5B5B5B')

    img.save(output_path)
    print(f"Image saved to {output_path}")


# Example usage
if __name__ == "__main__":
    generate_confession_image(
        residence="TotemPark",
        confession_text="leopard hair 😭 guy just proved their point 😭😭",
        submission_date="4/1/25, 12:39 PM",
        output_path="totem_confession_output.png",
        remove_emojis=True  # Set to True to remove emojis from rendering
    )
    generate_confession_image(
        residence="OrchardCommons",
        confession_text="i went to the store",
        submission_date="4/2/25, 12:39 PM",
        output_path="orchard_confession_output.png",
        remove_emojis=True  # Set to True to remove emojis from rendering
    )
    generate_confession_image(
        residence="PlaceVanier",
        confession_text="tsangy pangy paxy daxy",
        submission_date="4/3/25, 12:39 PM",
        output_path="vanier_confession_output.png",
        remove_emojis=True  # Set to True to remove emojis from rendering
    )
