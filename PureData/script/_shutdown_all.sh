#!/bin/bash

# Pour éteindre tous les raspberries


dir=$(dirname "$0")
. "$dir/../../namespace.sh"

if ! [ -z "$2" ]
then

debut=$1
fin=$2
for((c=${debut}; c<=${fin}; c++))
do
	echo ssh $_ADDRESS_HEADER.$c
	sshpass -praspberry ssh $_ADDRESS_HEADER.$c 'sudo poweroff'
done
else

	 echo "usage: _shutdown_all.sh <first raspberry number> <last raspberry number>\n
eg: _shutdown_all.sh 1 32"
fi
