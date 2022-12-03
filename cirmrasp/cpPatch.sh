#!/bin/bash

# Pour copier depuis le répertoire local cirmrasp vers des raspberries
# dans /home/pi/cirmrasp, en 2eme position num du premier raspberry et 
# en 3eme position num du dernier raspberry.
# ex: ./scpras.sh sounds/toto.wav 1 7

echo "Bash version ${BASH_VERSION}"

debut=$2
fin=$3
for((c=${debut}; c<=${fin}; c++))
do
	echo sshpass -praspberry scp $1 pi@192.168.1.$c:/home/pi/PureData/$1
	sshpass -praspberry scp $1 pi@192.168.1.$c:/home/pi/PureData/$1
done
