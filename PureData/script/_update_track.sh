#!/bin/bash

# Pour copier depuis le répertoire local un dossier tracks vers des raspberries
# dans /home/patch/modulePre/tracks, en 2eme position num du premier raspberry et
# en 3eme position num du dernier raspberry.
# ex: ./_update_track.sh skini 1 7

dir=$(dirname "$0")
. "$dir/../../namespace.sh"

_COPY_COMMAND="rsync -avuPe ssh"

_DIR=PureData/compositions;

if ! [ -z "$3" ]
then

debut=$2
fin=$3
for((c=${debut}; c<=${fin}; c++))
do
	echo sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c rm -r $_NAMESPACE/$_DIR/$1
	sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c rm -r $_NAMESPACE/$_DIR/$1
	echo sshpass -p$_PASSWORD $_COPY_COMMAND $_DIR/$1 $_ADDRESS_HEADER.$c:$_NAMESPACE/$_DIR
	sshpass -p$_PASSWORD $_COPY_COMMAND $_DIR/$1 $_ADDRESS_HEADER.$c:$_NAMESPACE/$_DIR
done
else

	 echo "usage: _update_track.sh <track name> <first raspberry number> <last raspberry number>\n
eg: _update_track.sh skini 1 32"
fi

# sshpass permet de se log à distance (-pmotdepasse)
# $1 est l'adresse locale du fichier à copier
# $2 et $3 indiquent les n° des raspberry
