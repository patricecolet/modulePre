#!/bin/bash

# Pour copier depuis le répertoire local cirmrasp vers des raspberries
# dans /home/pi/cirmrasp, en 2eme position num du premier raspberry et 
# en 3eme position num du dernier raspberry.
# ex: ./update_patch.sh _load.pd 1 7

echo "Bash version ${BASH_VERSION}"

source ../script/namespace.sh

debut=$2
fin=$3
for((c=${debut}; c<=${fin}; c++))
do
	echo sshpass -praspberry scp $1 pi@192.168.1.$c:$_NAMESPACE/PureData/gametrak_gamelan/$1
	sshpass -praspberry scp $1 pi@192.168.1.$c:$_NAMESPACE/PureData/gametrak_gamelan/$1
done

# sshpass permet de se log à distance (-pmotdepasse)
# scp permet de copier le fichier
# $1 est l'adresse locale du fichier à copier
# $2 et $3 indiquent les n° des raspberry
