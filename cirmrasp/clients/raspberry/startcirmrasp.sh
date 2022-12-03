#!/bin/bash

env sleep 5

# namespace.sh contient le chemin vers le dossier modulePre dans la Raspberry
# ce fichier permet de modifier le chemin dans tous les scripts
# en cas de changement d'environnement

#. $(dirname "$0")/../../../namespace.sh

node $(dirname "$0")/rasp.js 2>&1
