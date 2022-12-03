#!/bin/bash
if [ $(uname) == "Darwin" ]  ; then
echo `ipconfig getifaddr en0`
fi
if  [ $(uname) == "Linux" ]  ; then
ip=`hostname -I`
res=( $ip )
echo ${res[0]}
fi
