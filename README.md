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

`line="@reboot /home/patch/modulePre/PureData/script/installSouncard.sh"`   <br />
`(sudo crontab -u root -l; echo "$line" ) | sudo crontab -u root -`   <br />
install pirate audio   <br />
`sudo apt-get install python3-pip`   <br />
`cd ~/repo`   <br />
`git clone https://github.com/pimoroni/pirate-audio`  <br />
`cd pirate-audio/mopidy`  <br />
`sudo ./install.sh`  <br />
`sudo systemctl disable mopidy`  <br />
