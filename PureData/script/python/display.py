#!/usr/bin/env python
import socket
import time
import RPi.GPIO as GPIO
from ST7789 import ST7789
from PIL import Image, ImageDraw, ImageFont

UDP_IP = "127.0.0.1"
UDP_RECEIVE_PORT = 5005
UDP_SEND_PORT    = 5006
sock = socket.socket(socket.AF_INET, # Internet
                     socket.SOCK_DGRAM) # UDP
sock.bind((UDP_IP, UDP_RECEIVE_PORT))
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

SPI_SPEED_MHZ = 90

BUTTONS = [5, 6, 16, 24]

# These correspond to buttons A, B, X and Y respectively
LABELS = ['A', 'B', 'X', 'Y']

# Give us an image buffer to draw into
image = Image.new("RGB", (240, 240), (2, 0, 25))
draw = ImageDraw.Draw(image)
numFont = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
textFont = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)

# Standard display setup for Pirate Audio, except we omit the backlight pin
st7789 = ST7789(
    rotation=90,     # Needed to display the right way up on Pirate Audio
    port=0,          # SPI port
    cs=1,            # SPI port Chip-select channel
    dc=9,            # BCM pin used for data/command
    backlight=None,  # We'll control the backlight ourselves
    spi_speed_hz=SPI_SPEED_MHZ * 1000 * 1000
)

GPIO.setmode(GPIO.BCM)

GPIO.setup(BUTTONS, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def handle_button(pin):
    label = LABELS[BUTTONS.index(pin)]
    print("Button press detected on pin: {} label: {}".format(pin, label))
    s.sendto(bytes(label, 'utf-8'),(UDP_IP, UDP_SEND_PORT))

for pin in BUTTONS:
    GPIO.add_event_detect(pin, GPIO.FALLING, handle_button, bouncetime=300)

# We must set the backlight pin up as an output first
GPIO.setup(13, GPIO.OUT)

# Set up our pin as a PWM output at 500Hz
backlight = GPIO.PWM(13, 500)

# Start the PWM at 100% duty cycle
backlight.start(100)
fontColor = (255,255,255)
draw.multiline_text((10, 100), 'Loading PureData...', fill=fontColor, font=textFont)
st7789.display(image)
index ="0"
track = "noTrack!"
cue = "0"
while True:
    data = sock.recv(1024).decode() # buffer size is 1024 bytes
    data = data.replace(";", "")
    print("received message: %s" % data)
    data = data.split(" ")
    if  data[0] == "track":
        index = data[1]
        track = data[2]
    if data[0] == "cue":
       cue = data[1]
    W, H = 240,240
    draw.rectangle((0, 0, W, H), (25, 0, 25))
    _, _, w, h = draw.textbbox((0, 0), track, font=textFont)
    draw.multiline_text((100, 10), index, fill=fontColor, font=numFont)
    draw.multiline_text((100, 180), cue, fill=fontColor, font=numFont)
    draw.text(((W-w)/2, (H-h)/2), track, font=textFont, fill=fontColor)
    draw.multiline_text((1, 20), 'index', fill=fontColor, font=textFont)
    draw.multiline_text((1, 180), 'cue', fill=fontColor, font=textFont)
    # Display the resulting image
    st7789.display(image)
    time.sleep(1.0 / 30)

backlight.stop()
