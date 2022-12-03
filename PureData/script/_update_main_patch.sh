#!/bin/bash

# Pour copier le patch _load_on_boot.pd depuis le répertoire local cirmrasp vers des raspberries
# dans /home/patch/cirmrasp, en 2eme position num du premier raspberry et
# en 3eme position num du dernier raspberry.
# ex: ./update_main_patch.sh 1 7


dir=$(dirname "$0")
. "$dir/../../namespace.sh"

_COPY_COMMAND="rsync -avuPe ssh"

_MAIN_PATCH="PureData/_load_on_boot.pd"

if ! [ -z "$2" ]
then

debut=$1
fin=$2
for((c=${debut}; c<=${fin}; c++))
do
	echo sshpass  -p$_PASSWORD $_COPY_COMMAND $_MAIN_PATCH $_ADDRESS_HEADER.$c:$_NAMESPACE/$_MAIN_PATCH
	sshpass -p$_PASSWORD $_COPY_COMMAND $_MAIN_PATCH $_ADDRESS_HEADER.$c:$_NAMESPACE/$_MAIN_PATCH
done
else

	 echo "usage: _update_main_patch.sh <first raspberry number> <last raspberry number>\n
eg: _update_main_patch.sh 1 32"
fi
# sshpass permet de se log à distance (-pmotdepasse)
# scp permet de copier le fichier
# $1 est l'adresse locale du fichier à copier
# $2 et $3 indiquent les n° des raspberry
# scp -r pour copier un dossier
