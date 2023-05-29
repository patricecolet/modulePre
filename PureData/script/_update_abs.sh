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
_PD_DIR=PureData
_ABS_DIR="$_PD_DIR/abs";

if ! [ -z "$2" ]
then

debut=$1
fin=$2
for((c=${debut}; c<=${fin}; c++))
do
	echo sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c rm -r $_NAMESPACE/$_ABS_DIR
	sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c rm -r $_NAMESPACE/$_ABS_DIR
	echo sshpass -p$_PASSWORD $_COPY_COMMAND $_DIR/$_ABS_DIR $_ADDRESS_HEADER.$c:$_NAMESPACE/$_PD_DIR
	sshpass -p$_PASSWORD $_COPY_COMMAND $_DIR/$_ABS_DIR $_ADDRESS_HEADER.$c:$_NAMESPACE/$_PD_DIR
done
else

	 echo "usage: _update_externals.sh <external name> <first raspberry number> <last raspberry number>\n
eg: _update_externals.sh purest_json 1 32"
fi

# sshpass permet de se log à distance (-pmotdepasse)
# $1 est l'adresse locale du fichier à copier
# $2 et $3 indiquent les n° des raspberry
