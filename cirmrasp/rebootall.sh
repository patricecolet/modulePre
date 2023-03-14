#!/bin/bash

# Pour copier depuis le répertoire local cirmrasp vers des raspberries
# ex: ./reboot.sh 1 7

echo "Bash version ${BASH_VERSION}"

debut=$1
fin=$2
for((c=${debut}; c<=${fin}; c++))
do
	echo ssh pi@192.168.1.$c
	sshpass -praspberry ssh pi@192.168.1.$c 'sudo reboot'
done
