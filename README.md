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

PureData and externals have to be installed from https://puredata.info/downloads/pure-data

For installing externals, PureData has a tool named deken that upload the external for the architecture of the machine where PureData has been installed. Actually, externals have to be installed one by one from menu help->install, but we work on some batch install...
The most important externals are:
>ggee
>purest_json version >= 2.0.0
>list_abs
>zexy

The compositions available in this repository needs those externals:
>flite
>hcs
>hid

Raspberry OS uses externals from debian packages repository listed into PureData/externals.txt and last version of purest_json


PureData `_load_on_boot.pd` patch uses a configuration file named `config.json`.
JSON format is human readable and computer friendly, this file is also used by node and batch scripts.

The file `config.json` contains PureData settings, raspberry informations like mac address and ip address, used soundcard, machine model, computer number,some comments, and composition list.

## OSC Communication

The main patch receives following OSC messages:

### /volume "float"
 from -inf to +27db
 
### /mute "boolean"
 1 mutes the sound
 
### /composition "integer"
composition index from config.json composition list

### /cue "integer"
cue index through a composition

The composition patch named `skini` broadcast wav files localised in ~/modulePre/PureData/compositions/skini/sons synchronised with the help of ableton_link. <br />
The wav file must have same samplerate configured into config.json's pdsettings, and must be named `son<sound index>.wav`.

skini can be controlled with following OSC messages:

### /skini/test 'sound index'
play `son<sound number>.wav` entirely at 0db.

### /skini/test 'sound index' 112
play `son<sound index>.wav` entirely at +12db.

### /skini/test 'sound index' 112 500
play `son<sound index>.wav` at +12db from 500 milliseconds until the end of sound.

### /skini/test 'sound index' 112 500 1000
play `son<sound index>.wav` at +12db from 500 milliseconds during 1000 milliseconds.

A 50ms fade out is processed at the end of sound.

### /skini/level "float"
output volume of the patch from -inf to 127db
default = 100 (0db)

### /skini/offset "integer"
add an offset to the ableton_link sync

### /skini/clear bang
empty FIFO buffer and stop playing sound

### /skini/poly "integer"
set polyphony, from 0 to 16, 0 disabling polyphony  <br />
default = 16

### /skini/quantize "integer"
0 = no quantize  <br />
1 = quantize to beat  <br />
2 = quantize to bar  <br />
default = 2

### /skini/startDSP boolean
turn on/off DSP in patch 


## Install from scratch

If you want to start from scratch without prepared sdcard follow these instructions:

Raspberry recommended OS is `patchbox OS` available here:

https://blokas.io/patchbox-os/

Copy the image into an sdcard. <br />
An then connect to raspberry. <br />

For ssh remote session wpa_supplicant.conf can be copied into /boot partition from any computer. <br />

username is `patch` and password is `blokaslabs`  <br />

in the first run change password to `raspberry`  <br />

git clone into /home/patch directory on raspberry and anywhere you like on remote computer: <br />
>cd ~   <br />
git clone git@github.com:patricecolet/modulePre.git

Raspberry ideal config is available in this repository.
Copy config.txt to /boot:  <br />
>cp ~/modulePre/config.txt /boot

PureData version in patchboxOS is a bit too old then we need to compile PureData:

>cd ~  <br />
mkdir repo <br />
cd repo <br />
git clone https://github.com/pure-data/pure-data.git <br />
sudo apt-get install fftw3-dev autoconf libtool gettext <br />
cd PureData <br />
./autogen.sh <br />
./configure --enable-jack --enable-fft <br />
make <br />
sudo make install <br />
sudo mv /usr/bin/pd /usr/bin/pd.old <br />
sudo ln -s /usr/local/bin/pd /usr/bin/pd <br />

Install PureData externals:  <br />
>cd ~/modulePre/PureData   <br />
< externals.txt xargs sudo apt-get install -y

for having those externals available into this fresh compiled PureData version add into ~/.pdsettings this line under path1:
>path2: /usr/lib/pd/extra

or open PureData in graphical mode and add this path into preferences.

`purest_json`external is necessary for parsing `config.json` and must be last version (>=2.0.0).
 For installing it open pd by typing `pd` in terminal 
and go to menu->help->install, search for `purest_json` and install.

Install nodejs:   <br />
>sudo apt-get install nodejs

Install jq commandline for parsing JSON in bash scripts:   <br />
>sudo apt-get install jq   <br />

setup crontab for loading pd and node at start   <br />
>line="@reboot /home/patch/modulePre/PureData/script/startPureData.sh"   <br />
(crontab -u patch -l; echo "$line" ) | crontab -u patch -   <br />
line="@reboot /home/patch/modulePre/cirmrasp/clients/raspberry/startcirmrasp.sh"   <br />
(crontab -u patch -l; echo "$line" ) | crontab -u patch -   <br />

This script install soundcard automatically, it must be loaded by root:
>line="@reboot /home/patch/modulePre/PureData/script/installSouncard.sh"   <br />
(sudo crontab -u root -l; echo "$line" ) | sudo crontab -u root -   <br />

note: The soundcard driver is defined in config.json, the default driver is `hifiberry-dacplus`, if you install another soundcard, the raspberry needs to be rebooted after first boot with the new soundcard.

Install pirate audio:   <br />
>sudo apt-get install python3-pip   <br />
cd ~/repo   <br />
git clone https://github.com/pimoroni/pirate-audio  <br />
cd pirate-audio/mopidy  <br />
sudo ./install.sh  <br />
sudo systemctl disable mopidy  <br />

Finally reboot raspberry:
>sudo reboot

## SSH X11 Forwarding

A remote ssh session can be launched with X11 forwarding, with following command:

>ssh -XY patch@"ip of the raspberry"

The graphical interface will appear on remote computer, this is usefull for modifying PureData patches without using a VNC session or without connecting a screen, a mouse and a keyboard to the target raspberry.
Then on terminal you can check if PureData is running:
> ps aux | grep pd

if PureData is running the command result should display those lines:

>patch      701 12.3 12.3 133264 117272 ?       SLl  12:57   0:02 pd -nogui -alsamidi -jack -r 48000 -audiobuf 2 /home/patch/modulePre/PureData/_load_on_boot.pd
patch      729  0.0  0.0   1928   428 ?        S    12:57   0:00 /usr/local/lib/pd/bin/pd-watchdog

Before starting PureData for editing patches we need to end this pd process running on the background:
>killall pd

Then start PureData:
>pd

For retrieving the work made on a raspberry we can use rsync command on remote computer.
First exit ssh session by typing on target computer:
>exit

And then we're back on remote terminal, now we can use rsync command using target's ip address:
> cd modulePre
rsync -avuP patch@"raspberry ip address":/home/patch/modulePre/PureData/compositions/myComposition/myPatch.pd PureData/compositions/myComposition/
