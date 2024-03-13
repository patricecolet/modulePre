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
_SOUND_DIR="PureData/compositions/${1}"
# local path
_LOCAL_DIR=$ROOT_DIR/$_SOUND_DIR
# distant path
_DISTANT_DIR=${_NAMESPACE}/$_SOUND_DIR
# rsync is the command for updating files
_COPY_COMMAND="sshpass -p${_PASSWORD} rsync -avP";
# make a directory if doesn't exist
_SSHPASS="sshpass -p${_PASSWORD} ssh"

if ! [ -z "$4" ]
then

	debut=$3;
	fin=$4;
	for((c=${debut}; c<=${fin}; c++))
	do
		echo $_SSHPASS $_ADDRESS_HEADER.$c mkdir $_DISTANT_DIR
		$_SSHPASS $_ADDRESS_HEADER.$c mkdir $_DISTANT_DIR
		echo $_COPY_COMMAND $_LOCAL_DIR/$2 $_ADDRESS_HEADER.$c:$_DISTANT_DIR
		$_COPY_COMMAND $_LOCAL_DIR/$2 $_ADDRESS_HEADER.$c:$_DISTANT_DIR
	done
else

	 echo "usage: _upload_sample.sh \"composition relative sound path\" \"soundname\" <first raspberry number> <last raspberry number>\n
eg: ex: ./_upload_sample.sh pupitre/sons/pads pad1.wav 75 80"
fi

# sshpass permet de se log à distance (-pmotdepasse)
# rsync permet de copier le fichier
# $1 est le nom du dossier de composition
# $2 est le nom du patch
# $3 et $4 indiquent les n° des raspberry
