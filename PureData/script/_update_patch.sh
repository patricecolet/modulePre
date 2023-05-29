#!/bin/bash

# Pour copier un patch depuis le répertoire local vers des raspberries
# dans /home/pi/modulePre/PureData/compositions, en 1ere position le nom de la compositions
# en 2eme position le nom du patch
# en 3eme position num du premier raspberry et
# en 4eme position num du dernier raspberry.
# ex: ./update_patch.sh nuageAmoureux sampler.pd 1 7

# echo "Bash version ${BASH_VERSION}"
# get script path
_DIR=$(dirname "$0");
# get absolute script path
_DIR=$(readlink -f "$_DIR")
# get modulePre root path
ROOT_DIR=$(dirname $(dirname $_DIR));
# include namespace variables
. "$ROOT_DIR/namespace.sh";
# Path to compostion
_COMPO_DIR="PureData/compositions/${1}"
# local path
_LOCAL_DIR=$ROOT_DIR/$_COMPO_DIR
# distant path
_DISTANT_DIR=${_NAMESPACE}/$_COMPO_DIR
# rsync is the command for updating files
_COPY_COMMAND="sshpass -p${_PASSWORD} rsync -avP";

if ! [ -z "$4" ]
then

	debut=$3;
	fin=$4;
	for((c=${debut}; c<=${fin}; c++))
	do
		echo $_COPY_COMMAND $_LOCAL_DIR/$2 $_ADDRESS_HEADER.$c:$_DISTANT_DIR
		$_COPY_COMMAND $_LOCAL_DIR/$2 $_ADDRESS_HEADER.$c:$_DISTANT_DIR
	done
else

	 echo "usage: _update_patch.sh \"composition name\" \"patchname\" <first raspberry number> <last raspberry number>\n
eg: ex: ./update_patch.sh nuageAmoureux sampler.pd 1 7"
fi

# sshpass permet de se log à distance (-pmotdepasse)
# rsync permet de copier le fichier
# $1 est le nom du dossier de composition
# $2 est le nom du patch
# $3 et $4 indiquent les n° des raspberry
