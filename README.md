# modulePre

modulePre is a computer cluster made of raspberry PI equiped with a speaker and an amplifier for broadcasting localised sounds.

This repository is used on both raspberry and remote computer.
Remote computer Operating System must be linux or MacOS.

git clone this repository to control and edit modulePre PureData patches:
>git clone git@github.com:patricecolet/modulePre.git

## cirmrasp
cirmrasp contains a node server for controlling raspberry cluster containing a node client and OpenStageControl for OSC communication with PureData.
Each raspberry is identified with mac address and it's number is the last byte of IP address.
The node client installed into raspberry provides IP address to the node server.

## PureData

PureData have to be installed from https://puredata.info/downloads/pure-data

For installing externals, PureData has a tool named deken for uploading the external. Actually, externals have to be installed one by one from menu help->install, but we work on some batch install...
The most important externals are:
>ggee <br />
purest_json version >= 2.0.0 <br />
list_abs <br />
zexy

The compositions available in this repository needs those externals:
>flite <br />
hcs <br />
hid

Raspberry OS uses externals from debian packages repository listed into PureData/externals.txt and last version of purest_json


PureData `_load_on_boot.pd` patch uses a configuration file named `config.json`.
JSON format is human readable and computer friendly, this file is also used by node and batch scripts.

The file `config.json` contains PureData settings, raspberry informations like mac address and ip address, used soundcard, machine model, computer number,some comments, and composition list.

## OSC Communication

The main patch receives following OSC messages on port 4000:

### /volume "float"
 from 0 to 127 (100=0db)

### /mute "boolean"
 1 mutes the sound

### /composition "integer"
composition index from config.json composition list

### /cue "integer"
cue index through a composition

default composition list is defined like this:

>	"compositions":[ <br />
			{ <br />
				"title":"skini", <br />
				"comment":"Load skini patch" <br />
			}, <br />
      { <br />
        "title":"flite", <br />
        "comment":"Load at boot" <br />
      }, <br />
			{ <br />
				"title":"pirateAudio", <br />
				"comment":"example patch for pirate audio soundcard and display" <br />
			}, <br />
			{ <br />
				"title":"qTouch", <br />
				"comment":"SAMD21 usbmidi" <br />
			}, <br />
			{ <br />
				"title":"BLTMIDI", <br />
				"comment":"esp32-C3 bluetooth midi" <br />
			}, <br />
			{ <br />
				"title":"blank", <br />
				"comment":"template patch" <br />
			} <br />
	] <br />

## composition 0 : skini

The composition patch named `skini` broadcast wav files localised in ~/modulePre/PureData/compositions/skini/sons synchronised with the help of ableton_link. <br />
The wav file must have same samplerate configured into config.json's pdsettings, and must be named `son<sound index>.wav`.

skini can be controlled with following OSC messages:

### /play 'sound index'
play `son<sound number>.wav` entirely at 0db.

### /play 'sound index' 112
play `son<sound index>.wav` entirely at +12db.

###  /play 'sound index' 90 500
play `son<sound index>.wav` at -10db from 500 milliseconds until the end of sound.

### /play 'sound index' 100 500 1000
play `son<sound index>.wav` at 0db from 500 milliseconds during 1000 milliseconds.

A 50ms fade out is processed at the end of sound.

### /level "float"
output volume of the patch from -inf to 127db
default = 100 (0db)

### /offset "integer"
add an offset to the ableton_link sync

### /clear bang
empty FIFO buffer and stop playing sound

### /poly "integer"
set polyphony, from 0 to 16, 0 disabling polyphony  <br />
default = 16

### /quantize "integer"
0 = no quantize  <br />
1 = quantize to bar  <br />
2 = quantize to beat  <br />
default = 1

### /startDSP boolean
turn on/off DSP in patch

## composition 1 : flite

The composition `flite`reads computer number and mac adress and speak it at boot.
It receives following commands:

### /speak 'Hello world'
text to speech.

### /computer_number bang
speaks computer number.



## composition 2 : pirateAudio

This is a fork of skini with pirate audio raspberry shield's display and buttons handling.

## Install from scratch

If you want to start from scratch without prepared sdcard follow these instructions:

Raspberry recommended OS is `Raspberry Pi OS Lite 64bit` available here:

https://www.raspberrypi.com/software/operating-systems/

Copy the image into an sdcard. <br />
An then connect a screen and keyboard to raspberry. <br />

At the first run, set language, username to  `pi` and password to `raspberry` <br />
launch raspi-config to enable wifi and needed interfaces: <br />

>$: sudo raspi-config

The OS doesn't come with a graphic server, we recommend xfce4 a light desktop manager: <br />

>$: sudo apt install xfce4

Reboot the raspberry to see if everything is okay

>$: sudo reboot

Then login with `pi` username and `raspberry` password <br />

The command `startx` in console will launch the graphical mode <br />

To ease PureData install we recommend using a remote computer.

From your mac or linux machine copy modulePre folder to /home/pi directory:

>rsync -avuP modulePre pi@"raspberry ip":/home/pi

Don't forget to replace "raspberry ip" with the right ip adress... <br />

On macos we recommend homebrew for using command line tools, see https://brew.sh/ <br />

From linux the command `arp` should tell the ip of your raspberrypi. <br />
From mac the command `netstat -rn | grep en0` should show the ip of your raspberrypi. <br />

Then start an ssh session, see [SSH section](## SSH X11 Forwarding) <br />

PureData version in Debian bulleyes packages is a bit too old, compile PureData is easier than switching to Debian Sid :

>$: cd ~  <br />
$: mkdir repo && cd repo <br />
$: sudo apt install git autoconf libtool gettext tcl-dev tk alsa-tools libasound2-dev <br />
$: git clone https://github.com/pure-data/pure-data.git && cd pure-data <br />
$: ./autogen.sh <br />
$: ./configure <br />
$: make <br />
$: sudo make install <br />



Install PureData externals:
>$: cd ~/modulePre/PureData   <br />
$: < externals.txt xargs sudo apt-get install -y

for having those externals available into this fresh compiled PureData version add into ~/.pdsettings this line under path1:
>path2: /usr/lib/pd/extra

or open PureData in graphical mode and add this path into preferences. <br />


`purest_json`external is necessary for parsing `config.json` and must be last version (>=2.0.0).

PureData have a package manager for installing externals and it will ask to choose a directory, we recommend to make directory in /home/pi called pd-externals

>$: mkdir ~/pd-externals

The launch PureData by typing `pd` in terminal and go to menu->help->install, search for `purest_json` and install after choosing pd-externals directory.


Install nodejs:   <br />
>$: sudo apt install nodejs

Install jq commandline for parsing JSON in bash scripts:   <br />
>$: sudo apt install jq   <br />

setup crontab for loading pd and node at start
>$: line="@reboot /home/pi/modulePre/PureData/script/startPureData.sh"
$: (crontab -u pi -l; echo "$line" ) | crontab -u pi -
>$: line="@reboot /home/pi/modulePre/cirmrasp/clients/raspberry/startcirmrasp.sh"  
$: (crontab -u pi -l; echo "$line" ) | crontab -u pi -

to visualize crontab type `crontab -e`

This script install soundcard automatically, it must be loaded by root.
If you launch those commands for the first time, the terminal will complain "no crontab for root". It's means that you need to select a text editor:
>$: sudo select-editor

Then choose your favorite editor, we recommend `nano`
And fill crontab for root:
>$: line="@reboot /home/pi/modulePre/PureData/script/installSouncard.sh"
$: (sudo crontab -u root -l; echo "$line" ) | sudo crontab -u root -

To visualize root crontab type `sudo crontab -e`<br />

### /boot/config.txt

The internal soundcard had to be removed from /boot/config.txt by commenting the line:

> dtparam=audio=on

The script `installSouncard.sh` looks into /boot/config.txt if the soundcard defined in config.json is installed, add this line at the top of the text file with the text editor:

>dtoverlay=hifiberry-dacplus

We need to disable hdmi soundcard by adding ",noaudio" to this lines

>dtoverlay=vc4-kms-v3d

it should look like this:
>dtoverlay=vc4-kms-v3d,noaudio

this command will show up the installed soundcard:

>aplay -l

For digiamp+ the result should look like This:
>**** List of PLAYBACK Hardware Devices ****
card 0: IQaudIODAC [IQaudIODAC], device 0: IQaudIO DAC HiFi pcm512x-hifi-0 [IQaudIO DAC HiFi pcm512x-hifi-0]
  Subdevices: 0/1
  Subdevice #0: subdevice #0

### Pirate audio

Pirate audio is a soundcard hat for raspberry used for displaying, monitoring, and controlling some modulePre cluster compositions

Install pirate audio:   <br />
>$: sudo apt-get install python3-pip   <br />
$: cd ~/repo   <br />
$: git clone https://github.com/pimoroni/pirate-audio  <br />
$: cd pirate-audio/mopidy  <br />
$: sudo ./install.sh  <br />
$: sudo systemctl disable mopidy  <br />

Finally reboot raspberry:
>sudo reboot


### jack
If you have choosen to use jackd, we need to set samplerate, `/etc/jackdrc` should look like this:    <br />

>#!/bin/sh    <br />   <br />
CONFIG_FILE='/home/patch/modulePre/config.json'    <br />
pdsettings=$(cat $CONFIG_DIR/config.json | jq '.pdsettings');   <br />
samplerate=$(echo $pdsettings | jq -r '.samplerate');   <br />
exec /usr/bin/jackd -t 2000 -R -P 95 -d alsa  -r $samplerate -p 64 -n 2 -X seq -s -S    <br />

## SSH X11 Forwarding

On macos we recommend using Xquartz, see https://formulae.brew.sh/cask/xquartz <br />
If you have trouble, try those command lines before launching SS session:

>$: launchctl start org.xquartz.startx
$: export DISPLAY=:0

A remote ssh session can be launched with X11 forwarding, with following command:

>$: ssh -XY patch@"ip of the raspberry"

The graphical interface will appear on remote computer, this is usefull for modifying PureData patches without using a VNC session or without connecting a screen, a mouse and a keyboard to the target raspberry.
Then on terminal you can check if PureData is running:
>$: ps aux | grep pd

if PureData is running the command result should display those lines:

>$: patch      701 12.3 12.3 133264 117272 ?       SLl  12:57   0:02 pd -nogui -alsamidi -jack -r 48000 -audiobuf 2 /home/patch/modulePre/PureData/_load_on_boot.pd
patch      729  0.0  0.0   1928   428 ?        S    12:57   0:00 /usr/local/lib/pd/bin/pd-watchdog

Before starting PureData for editing patches we need to end this pd process running on the background:
>$: killall pd

Then start PureData:
>$: pd

For retrieving the work made on a raspberry we can use rsync command on remote computer.
First exit ssh session by typing on target computer:
>$: exit

And then we're back on remote terminal, now we can use rsync command using target's ip address:
>$: cd modulePre <br />
$: rsync -avuP patch@"raspberry ip address":/home/patch/modulePre/PureData/compositions/myComposition/myPatch.pd PureData/compositions/"myComposition"/

### Using modulePre on macos

On macos the following command will enable script execution:

>%: chmod +x PureData/script/*.sh
