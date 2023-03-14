#!/bin/bash

# Pour copier depuis le répertoire local un external vers des raspberries
# dans /home/pi/modulePre/PureData/pd-externals, en 2eme position num du premier raspberry et
# en 3eme position num du dernier raspberry.
# ex: ./_update_externals.sh purest_json 1 7

# get script path
_DIR=$(dirname "$0");
# get absolute script path
_DIR=$(readlink -f "$_DIR")
# get modulePre root path
_DIR=$(dirname $(dirname $_DIR));
# include namespace variables
. "$_DIR/namespace.sh";

_COPY_COMMAND="rsync -avuPe ssh"

EXTERNAL_DIR="PureData/pd-externals";

if ! [ -z "$3" ]
then

debut=$2
fin=$3
for((c=${debut}; c<=${fin}; c++))
do
	echo sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c rm -r /home/${_USER}/pd-externals/$1
	sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c rm -r /home/${_USER}/pd-externals/$1
	echo sshpass -p$_PASSWORD $_COPY_COMMAND $_DIR/$EXTERNAL_DIR/$1 $_ADDRESS_HEADER.$c:/home/${_USER}/pd-externals
	sshpass -p$_PASSWORD $_COPY_COMMAND $_DIR/$EXTERNAL_DIR/$1 $_ADDRESS_HEADER.$c:/home/${_USER}/pd-externals
done
else

	 echo "usage: _update_externals.sh <external name> <first raspberry number> <last raspberry number>\n
eg: _update_externals.sh purest_json 1 32"
fi

# sshpass permet de se log à distance (-pmotdepasse)
# $1 est l'adresse locale du fichier à copier
# $2 et $3 indiquent les n° des raspberry
