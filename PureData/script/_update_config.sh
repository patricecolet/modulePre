#!/bin/bash

# Pour copier le fichier _load_on_boot.txt depuis le répertoire local cirmrasp vers des raspberries
# dans /home/patch/cirmrasp, en 2eme position num du premier raspberry et
# en 3eme position num du dernier raspberry.
# ex: ./update_config.sh 1 7

# echo "Bash version ${BASH_VERSION}"

dir=$(dirname "$0")
. "$dir/../../namespace.sh"

_COPY_COMMAND="rsync -avuPe ssh"

_PD_CONFIG=config.json

if ! [ -z "$2" ]
then

	debut=$1;
	fin=$2;
	for((c=${debut}; c<=${fin}; c++))
	do
		echo sshpass -p$_PASSWORD $_COPY_COMMAND $_PD_CONFIG $_ADDRESS_HEADER.$c:$_NAMESPACE/$_PD_CONFIG
		sshpass -p$_PASSWORD $_COPY_COMMAND $_PD_CONFIG $_ADDRESS_HEADER.$c:$_NAMESPACE/$_PD_CONFIG
	done
else

	 echo "usage: _update_config.sh <first raspberry number> <last raspberry number>\n
eg: _update_config.sh 1 32"
fi

# sshpass permet de se log à distance (-pmotdepasse)
# scp permet de copier le fichier
# $1 est l'adresse locale du fichier à copier
# $2 et $3 indiquent les n° des raspberry
# scp -r pour copier un dossier
