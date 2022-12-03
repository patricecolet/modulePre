#!/bin/bash

# Copie des fichiers son'N°son'-'N°dRasp'.wav
# vers des Raspberies dans le réseau 192.168.1.X
# où chaque Raspberry est identifié par X.

for filename in *.wav; do
	bar=${filename}

	# Prend après '-'
	rasp0=${bar#*-*}
	# Enlève .wav
	numberRasp=${rasp0%*.wav}
	# Enlève les 0 en tête
	newNumberRasp=$(echo $numberRasp | sed 's/^0*//')

	# Prend avant '-''
	sound=${bar%*-*.wav}
	# Enlève son
	numberSound=${sound#*son*}
	# Enlève les 0 en tête
	newNumberSound=$(echo $numberSound | sed 's/^0*//')
	# Reconstitue le nom sur le raspberry // modifier le nom en fonction de la pièce.
	newSound=son_elise${newNumberSound}.wav

	echo sshpass -praspberry scp ./${bar} pi@192.168.1.${newNumberRasp}:/home/pi/PureData/${newSound}
	sshpass -praspberry scp ./${bar} pi@192.168.1.${newNumberRasp}:/home/pi/PureData/${newSound}
done

# sshpass -praspberry scp ./${bar} pi@192.168.1.${newNumberRasp}:/home/pi/PureData/track_1/${newSound}