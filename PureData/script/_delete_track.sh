#!/bin/bash

# Pour un dossier dans le répertoire tracks des raspberries
# dans /home/patch/modulePre/tracks en 2eme position num du premier raspberry et
# en 3eme position num du dernier raspberry.
# ex: ./_delete_track.sh test_tone 1 7


dir=$(dirname "$0")
. "$dir/../../namespace.sh"


if ! [ -z "$3" ]
then

debut=$2
fin=$3
for((c=${debut}; c<=${fin}; c++))
do
	echo sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c rm -r $_NAMESPACE/PureData/compositions/$1
	sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c rm -r $_NAMESPACE/PureData/compositions/$1
done
else

	 echo "usage: _delete_track.sh <composition> <first raspberry number> <last raspberry number>\n
eg: _delete_track.sh SKINI 1 32"
fi
# sshpass permet de se log à distance (-pmotdepasse)
# scp permet de copier le fichier
# $1 est l'adresse locale du fichier à copier
# $2 et $3 indiquent les n° des raspberry
# rm -r pour supprimer un dossier
