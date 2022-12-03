# modulePre

modulePre is a computer cluster made of raspberry PI equiped with a speaker and an amplifier for broadcasting localised sounds.

This repository is used on both raspberry and remote computer.
Remote computer Operating System must be linux or MacOS.

## cirmrasp
cirmrasp contains a node server for controlling raspberry cluster containing a node client and OpenStageControl for OSC communication with PureData.
Each raspberry is identified with mac address and it's number is the last byte of IP address.
The node client installed into raspberry provides IP address to the node server.

## PureData
PureData `_load_on_boot.pd` patch uses a configuration file named `config.json`

This contains PureData settings, raspberry informations like mac address and ip address, used soundcard, machine model, computer number,some comments, and composition list.

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
The wav file must have same samplerate configured into pd settings, and must be named `son<sound index>.wav`.

skini can be controlled with following OSC messages:

### /skini/test 'sound index'
play `son<sound number>.wav` entirely at 0db.

### /skini/test 112
play `son<sound number>.wav` entirely at 12db.

### /skini/test 112 500
play `son<sound number>.wav` at 12db from 500 milliseconds until the end of sound.

### /skini/test 112 500 1000
play `son<sound number>.wav` at 12db from 500 milliseconds during 1000 milliseconds.

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

### /skini/quantize integer
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

git clone into /home/patch directory on raspberry and anywhere you like on remote computer. <br />
`cd ~` <br />
`git clone git@github.com:patricecolet/modulePre.git`  <br />

raspberry ideal config is available in this repository.
copy config.txt to /boot/  <br />
`cd ~/modulePre`  <br />
`cp config.txt /boot`  <br />

PureData version in patchboxOS is a bit too old then we need to compile PureData:

go to user directory: <br />
>cd ~  <br />
create git directory: <br />
`mkdir repo` <br />
enter into git directory: <br />
`cd repo` <br />
clone PureData repository: <br />
`git clone https://github.com/pure-data/pure-data.git` <br />
install build dependencies: <br />
`sudo apt-get install fftw3-dev autoconf libtool gettext` <br />
enter into pd directory <br />
`cd PureData` <br />
build PureData: <br />
`./autogen.sh` <br />
`./configure --enable-jack --enable-fft` <br />
`make` <br />
install puredata: <br />
`sudo make install` <br />
replace patchbox pd version with the compiled one: <br />
`sudo mv /usr/bin/pd /usr/bin/pd.old` <br />
`sudo ln -s /usr/local/bin/pd /usr/bin/pd` <br />

install PureData externals  <br />
`cd ~/modulePre/PureData`   <br />
`< externals.txt xargs sudo apt-get install -y`   <br />

install node   <br />
`sudo apt-get install nodejs`   <br />

install jq commandline for parsing JSON   <br />
`sudo apt-get install jq`   <br />

setup crontab for loading pd and node at start   <br />
`line="@reboot /home/patch/modulePre/PureData/script/startPureData.sh"`   <br />
`(crontab -u patch -l; echo "$line" ) | crontab -u patch -`   <br />
`line="@reboot /home/patch/modulePre/cirmrasp/clients/raspberry/startcirmrasp.sh"`   <br />
`(crontab -u patch -l; echo "$line" ) | crontab -u patch -`   <br />

This script install soundcard automatically
`line="@reboot /home/patch/modulePre/PureData/script/installSouncard.sh"`   <br />
`(sudo crontab -u root -l; echo "$line" ) | sudo crontab -u root -`   <br />

install pirate audio   <br />
`sudo apt-get install python3-pip`   <br />
`cd ~/repo`   <br />
`git clone https://github.com/pimoroni/pirate-audio`  <br />
`cd pirate-audio/mopidy`  <br />
`sudo ./install.sh`  <br />
`sudo systemctl disable mopidy`  <br />
