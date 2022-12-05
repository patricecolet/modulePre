#!/bin/bash

# Pour copier depuis le répertoire local cirmrasp vers des raspberries
# ex: ./reboot.sh 1 7

# get script path
_DIR=$(dirname "$0");
# get absolute script path
_DIR=$(readlink -f "$_DIR")
# get modulePre root path
_DIR=$(dirname $(dirname $_DIR));
# include namespace variables
. "$_DIR/namespace.sh";

if ! [ -z "$2" ]
then

debut=$1
fin=$2
for((c=${debut}; c<=${fin}; c++))
do
	echo ssh $_ADDRESS_HEADER.$c
	sshpass -praspberry ssh $_ADDRESS_HEADER.$c 'sudo reboot'
done
else

	 echo "usage: _rebootall.sh <first raspberry number> <last raspberry number>\n
eg: _rebootall.sh 1 32"
fi
