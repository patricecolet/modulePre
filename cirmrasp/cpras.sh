#!/bin/sh

source ../PureData/script/namespace.txt

scp $1 pi@192.168.0.7:$_NAMESPACE/cirmrasp/$1
