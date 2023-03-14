#!/bin/bash

if [ $(uname) == "Darwin" ]  ; then
echo `ifconfig en0 | awk '/ether/{print $2}'`
fi
if  [ $(uname) == "Linux" ]  ; then
cat /sys/class/net/wlan0/address
fi
