#!/bin/bash

# Pour copier depuis le répertoire local un dossier tracks vers des raspberries
# dans /home/patch/modulePre/tracks, en 2eme position num du premier raspberry et
# en 3eme position num du dernier raspberry.
# ex: ./_update_trackConfig.sh skini 1 7

# get script path
_DIR=$(dirname "$0");
# get absolute script path
_DIR=$(readlink -f "$_DIR")
# get modulePre root path
_DIR=$(dirname $(dirname $_DIR));
# include namespace variables
. "$_DIR/namespace.sh";

_COPY_COMMAND="rsync -ave ssh"

COMPO_DIR=PureData/compositions;

_TRACK_CONFIG=$_DIR/$COMPO_DIR/$1/trackConfig.json

echo 
if [ ! -f  $_TRACK_CONFIG ]; then
    echo "no trackConfig"
    exit 0

fi

if ! [ -z "$3" ]
then

debut=$2
fin=$3
for((c=${debut}; c<=${fin}; c++))
do

	echo sshpass -p$_PASSWORD $_COPY_COMMAND $_TRACK_CONFIG $_ADDRESS_HEADER.$c:$_NAMESPACE/$COMPO_DIR/$1
	sshpass -p$_PASSWORD  $_COPY_COMMAND $_TRACK_CONFIG $_ADDRESS_HEADER.$c:$_NAMESPACE/$COMPO_DIR/$1

    _samples=$(cat $_TRACK_CONFIG  | jq -r --argjson i $c '.modules | .[] | select(.computerID==$i) | .samples');
    for ((s=0;s<$_samples_length;s++))
    do
                _sampleName=$(echo $_samples | jq -r --argjson i $s '.[$i].sampleName')
                _sampleDir=$(echo $_samples | jq -r --argjson i $s '.[$i].sampleDir')
                echo sshpass -p$_PASSWORD $_COPY_COMMAND $_DIR/$COMPO_DIR/$1/$_soundPath/$_sampleDir/$_sampleName $_ADDRESS_HEADER.$c:$_NAMESPACE/$COMPO_DIR/$1/$_soundPath/$_sampleDir
                sshpass -p$_PASSWORD $_COPY_COMMAND $_DIR/$COMPO_DIR/$1/$_soundPath/$_sampleDir/$_sampleName $_ADDRESS_HEADER.$c:$_NAMESPACE/$COMPO_DIR/$1/$_soundPath/$_sampleDir
    done 
done
else

	 echo "usage: _update_trackConfig.sh <track name> <first raspberry number> <last raspberry number>\n
eg: _update_track.sh pupitre 1 32"
fi

# sshpass permet de se log à distance (-pmotdepasse)
# $1 est l'adresse locale du fichier à copier
# $2 et $3 indiquent les n° des raspberry
