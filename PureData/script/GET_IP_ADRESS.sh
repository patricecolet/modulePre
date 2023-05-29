#!/bin/bash
IP_ADDR=""
if [ $(uname) == "Darwin" ]  ; then
  IP_ADDR=`ipconfig getifaddr en0`
fi
if  [ $(uname) == "Linux" ]  ; then
ip=`hostname -I`
res=( $ip )
IP_ADDR=${res[0]}
fi

if [ -n "$IP_ADDR" ]; then
    echo "$IP_ADDR"
else
    echo "localhost"
fi
