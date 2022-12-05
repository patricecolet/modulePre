
#!/bin/bash

# Pour copier tous les dossiers depuis le répertoire tracks vers des raspberries
# dans /home/patch/modulePre/tracks, en 1ere position num du premier raspberry et
# en 2eme position num du dernier raspberry.
# ex: ./_update_all_tracks.sh 1 7


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

if ! [ -z "$2" ]
then

debut=$1
fin=$2
for((c=${debut}; c<=${fin}; c++))
do
	echo sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c rm -r $_NAMESPACE/$COMPO_DIR
	sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c rm -r $_NAMESPACE/$COMPO_DIR
	echo sshpass -p$_PASSWORD $_COPY_COMMAND $_DIR/COMPO_DIR $_ADDRESS_HEADER.$c:$_NAMESPACE/PureData
	sshpass -p$_PASSWORD $_COPY_COMMAND $_DIR/COMPO_DIR $_ADDRESS_HEADER.$c:$_NAMESPACE/PureData
done
else

	 echo "usage: _update_all_track.sh <first raspberry number> <last raspberry number>\n
eg: _update_track.sh 3 32"
fi

# sshpass permet de se log à distance (-pmotdepasse)
# rsync permet de copier le fichier
# $1 et $2 indiquent les n° des raspberry
# scp -r pour copier un dossier
