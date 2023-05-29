#!/bin/bash

# Pour copier depuis le répertoire local un dossier tracks vers des raspberries
# dans /home/patch/modulePre/tracks, en 2eme position num du premier raspberry et
# en 3eme position num du dernier raspberry.
# ex: ./_update_track.sh skini 1 7

# get script path
_DIR=$(dirname "$0");
# get absolute script path
_DIR=$(readlink -f "$_DIR")
# get modulePre root path
_DIR=$(dirname $(dirname $_DIR));
# include namespace variables
. "$_DIR/namespace.sh";

_COPY_COMMAND="rsync -avuPe ssh"

COMPO_DIR=PureData/compositions;

if ! [ -z "$3" ]
then

debut=$2
fin=$3
for((c=${debut}; c<=${fin}; c++))
do
	echo sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c rm -r $_NAMESPACE/$COMPO_DIR/$1
#	sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c rm -r $_NAMESPACE/$COMPO_DIR/$1
	echo sshpass -p$_PASSWORD $_COPY_COMMAND $_DIR/$COMPO_DIR/$1 $_ADDRESS_HEADER.$c:$_NAMESPACE/$COMPO_DIR
	sshpass -p$_PASSWORD $_COPY_COMMAND $_DIR/$COMPO_DIR/$1 $_ADDRESS_HEADER.$c:$_NAMESPACE/$COMPO_DIR
done
else

	 echo "usage: _update_track.sh <track name> <first raspberry number> <last raspberry number>\n
eg: _update_track.sh skini 1 32"
fi

# sshpass permet de se log à distance (-pmotdepasse)
# $1 est l'adresse locale du fichier à copier
# $2 et $3 indiquent les n° des raspberry
