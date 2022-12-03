# modulePre


This repository is used on both raspberry and remote computer.
Remote computer Operating System must be linux or MacOS.

## Install from scratch

If you want to start from scratch without prepared sdcard follow these instructions:

Raspberry recommended OS is `patchbox OS` available here:

https://blokas.io/patchbox-os/

Copy the image into an sdcard. <br />
An then connect to raspberry. <br />

For ssh remote session wpa_supplicant.conf can be copied into /boot partition from any computer. <br />

git clone into /home/patch directory on raspberry and anywhere you like on remote computer. <br />
`cd ~` <br />
`git clone git@github.com:patricecolet/modulePre.git`  <br />

raspberry ideal config is available in this repository.
copy config.txt to /boot/  <br />
`cd ~/modulePre`  <br />
`cp config.txt /boot`  <br />

PureData version in patchboxOS is a bit too old then we need to compile PureData:

go to user directory: <br />
`cd ~`  <br />
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
