#!/bin/bash

# Pour supprimer tous les dossiers dans le répertoire tracks des raspberries
# dans /home/patch/modulePre/tracks en 1ere position num du premier raspberry et
# en 2eme position num du dernier raspberry.
# ex: ./_delete_all_tracks.sh 1 7

# get script path
_DIR=$(dirname "$0");
# get absolute script path
_DIR=$(readlink -f "$_DIR")
# get modulePre root path
_DIR=$(dirname $(dirname $_DIR));
# include namespace variables
. "$_DIR/namespace.sh";


if ! [ -z "$2" ]
then

debut=$1
fin=$2
for((c=${debut}; c<=${fin}; c++))
do
	echo sshpass -p$_PASSWORD ssh $_USER@$_IP_HEADER.$c rm -r $_NAMESPACE/PureData/compositions/\*
	sshpass -p$_PASSWORD ssh $_USER@$_IP_HEADER.$c rm -r $_NAMESPACE/PureData/compositions/\*
done
else

	 echo "usage: _delete_all_tracks.sh <first raspberry number> <last raspberry number>\n
eg: _delete_all_tracks.sh 1 32"
fi
# sshpass permet de se log à distance (-pmotdepasse)
# scp permet de copier le fichier
# $1 est l'adresse locale du fichier à copier
# $2 et $3 indiquent les n° des raspberry
# rm -r pour supprimer un dossier
