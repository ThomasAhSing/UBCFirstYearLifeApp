import requests
from PIL import Image, ImageDraw, ImageFont
import textwrap
import datetime
import os
import emoji
import re
import json
from datetime import datetime

# Configurable settings
colors = {
    "PlaceVanier": {"background": "#FFDAD5", "accent": "#D65A4E"},
    "TotemPark": {"background": "#B0E9E3", "accent": "#009688"},
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
    x_start, y = position
    line_height = EMOJI_SIZE + 8

    # Split into tokens (words and emojis)
    tokens = split_text_and_emojis(text)

    # Step 1: Wrap lines using textwrap but measure pixel length
    lines = []
    current_line = []
    current_width = 0

    for token in tokens:
        token_width = EMOJI_SIZE if emoji.is_emoji(token) else draw.textlength(token, font=font)
        
        if current_width + token_width > max_width and current_line:
            lines.append(current_line)
            current_line = [token]
            current_width = token_width
        else:
            current_line.append(token)
            current_width += token_width

    if current_line:
        lines.append(current_line)

    # Step 2: Draw each line
    for line in lines:
        x = x_start
        for token in line:
            if emoji.is_emoji(token):
                code = '-'.join(f"{ord(c):x}" for c in token)
                emoji_path = os.path.join(EMOJI_FOLDER, f"{code}.png")
                if not os.path.exists(emoji_path):
                    emoji_path = download_emoji_image(code)
                if emoji_path and os.path.exists(emoji_path):
                    try:
                        emoji_img = Image.open(emoji_path).resize((EMOJI_SIZE, EMOJI_SIZE))
                        base_img.paste(emoji_img, (x, y), emoji_img.convert("RGBA"))
                    except Exception:
                        pass
                x += EMOJI_SIZE
            else:
                draw.text((x, y), token, font=font, fill="black")
                x += draw.textlength(token, font=font)
        y += line_height

def draw_text_wrapped(draw, text, position, font, max_width, line_spacing=8):
    x, y = position
    lines = []
    words = text.split()
    current_line = ""

    for word in words:
        test_line = f"{current_line} {word}".strip()
        if draw.textlength(test_line, font=font) <= max_width:
            current_line = test_line
        else:
            lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)

    for line in lines:
        draw.text((x, y), line, font=font, fill="black")
        y += font.getbbox(line)[3] + line_spacing  # Move y down



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

    bg_color = colors[residence.replace(" ", "")]["background"]
    accent = colors[residence.replace(" ", "")]["accent"]


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

    # draw_text_with_emojis(
    #     draw,
    #     img,
    #     confession_text,
    #     (bottom_box[0] + 20, bottom_box[1] + 100),
    #     font_body,
    #     max_width=bottom_box[2] - bottom_box[0] - 40
    # )
    draw_text_wrapped(
    draw,
    confession_text,
    (bottom_box[0] + 20, bottom_box[1] + 100),
    font=font_body,
    max_width=bottom_box[2] - bottom_box[0] - 40
    )

    # Make the "Submitted on" text italic and gray
    gray = (128, 128, 128)  # Gray color
    draw.text((width - 350, height - 50), f"Submitted {submission_date}", font=font_italic, fill='#5B5B5B')

    img.save(output_path)
    print(f"Image saved to {output_path}")


if __name__ == "__main__":

    input_files = [
        "../data/confessions/postedConfessions.json",
        "../data/confessions/unpostedConfessions.json"
    ]

    os.makedirs("../data/confessions/previewImages", exist_ok=True)  # make sure the folder exists

    for file_path in input_files:
        with open(file_path, "r") as f:
            data = json.load(f)
            for residence, posts in data.items():
                for post in posts:
                    for confession in post['confessions']:
                        if confession['confessionIndex'] == 1:
                            cid = confession['confessionID']
                            pid = post['postId']
                            timestamp = datetime.fromisoformat(confession['timestamp'])
                            formatted_date = timestamp.strftime("%-m/%-d/%y, %-I:%M %p")
                            output_name = f"../data/confessions/previewImages/{residence.replace(' ', '_').lower()}_cid{cid}_pid{pid}.png"
                            generate_confession_image(
                                residence=residence,
                                confession_text=confession['content'],
                                submission_date=formatted_date,
                                output_path=output_name,
                                remove_emojis=True
                            )


# # Example usage
# if __name__ == "__main__":
#     generate_confession_image(
#         residence="TotemPark",
#         confession_text="leopard hair 😭 guy just proved their point 😭😭",
#         submission_date="4/1/25, 12:39 PM",
#         output_path="totem_confession_output.png",
#         remove_emojis=True  # Set to True to remove emojis from rendering
#     )
#     generate_confession_image(
#         residence="OrchardCommons",
#         confession_text="i went to the store",
#         submission_date="4/2/25, 12:39 PM",
#         output_path="orchard_confession_output.png",
#         remove_emojis=True  # Set to True to remove emojis from rendering
#     )
#     generate_confession_image(
#         residence="PlaceVanier",
#         confession_text="tsangy pangy paxy daxy",
#         submission_date="4/3/25, 12:39 PM",
#         output_path="vanier_confession_output.png",
#         remove_emojis=True  # Set to True to remove emojis from rendering
#     )