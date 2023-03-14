#!/bin/bash

# Pour lancer une commande sur tous les raspberries
# dans /home/pi/modulePre/PureData/pd-externals, en 2eme position num du premier raspberry et
# en 3eme position num du dernier raspberry.
# ex: ./_dummy_command.sh "mkdir /home/pi/dummy" 1 7
# get script path
_DIR=$(dirname "$0");
# get absolute script path
_DIR=$(readlink -f "$_DIR")
# get modulePre root path
_DIR=$(dirname $(dirname $_DIR));
# include namespace variables
. "$_DIR/namespace.sh";


_COMMAND=$1


if ! [ -z "$2" ]
then

debut=$2
fin=$3
for((c=${debut}; c<=${fin}; c++))
do
    echo sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c $_COMMAND
	sshpass -p$_PASSWORD ssh $_ADDRESS_HEADER.$c $_COMMAND
done
else

	 echo "usage: _dummy_command.sh <"command"> <first raspberry number> <last raspberry number>\n
eg: _dummy_command.sh "mkdir /home/pi/dummy" 1 32"
fi

# sshpass permet de se log à distance (-pmotdepasse)
# $1 est la commande entre guillemets
# $2 et $3 indiquent les n° des raspberry
