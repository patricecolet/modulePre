# modulePre


This repository is used on both raspberry and remote computer.
Remote computer Operating System must be linux or MacOS.

## From scratch

If you want to start from scratch without prepared sdcard follow these instructions:

Raspberry recommended OS is `patchbox OS` available here:

https://blokas.io/patchbox-os/

git clone into /home/<user> directory on raspberry and anywhere you like on remote computer.

copy config.txt to /boot/

copy wpa_supplicant.conf to /etc/wpa_supplicant

PureData version in patchboxOS is a bit too old then we need to compile PureData:

# go to user directory
`cd ~`
# create git directory
`mkdir repo`
# enter into git directory
`cd repo`
# clone PureData repository
`git clone https://github.com/pure-data/pure-data.git`
# install build dependencies
`sudo apt-get install fftw3-dev autoconf libtool gettext`
# enter into pd directory
`cd PureData`
# build PureData
`./autogen.sh
./configure --enable-jack --enable-fft
make`
# install puredata
`sudo make install`
# replace patchbox pd version with the compiled one
`sudo mv /usr/bin/pd /usr/bin/pd.old
sudo ln -s /usr/local/bin/pd /usr/bin/pd`
