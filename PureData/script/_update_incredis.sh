#!/bin/bash

# Pour copier depuis le répertoire local un dossier tracks vers des raspberries
# dans /home/patch/modulePre/tracks, en 2eme position num du premier raspberry et
# en 3eme position num du dernier raspberry.
# ex: ./_update_track.sh skini 1 7

# get script path
_DIR=$(dirname "$0");
# get absolute script path
_DIR=$(readlink -f "$_DIR")
# get modulePre root path
_DIR=$(dirname $(dirname $_DIR));
# include namespace variables
. "$_DIR/namespace.sh";

# command for uploading files through sshpass
_COPY_COMMAND="sshpass -p${_PASSWORD} rsync -avP"
# Path to composition folder
_COMPO_DIR="PureData/compositions"
# Path to local composition folder
_LOCAL_DIR=$_DIR/$_COMPO_DIR/$1
# Path to Raspberry composition FOLDER
_DISTANT_DIR=$_NAMESPACE/$_COMPO_DIR/$1
# Path to composition sounds folder
_SOUND_FOLDERS=($(ls $_LOCAL_DIR/sons))

echo "DOSSIERS SON:"
echo "${_SOUND_FOLDERS[@]}"
NUM_SOUND_FOLDERS=${#_SOUND_FOLDERS[@]}

if ! [ -z "$3" ]
then

	echo DIRECTORY: $_LOCAL_DIR
#  rm $_LOCAL_DIR/trackConfig.json
	TAB="	"
  (
  echo {
  echo "${TAB}" \"globalSettings\" : {
  echo "${TAB}" "${TAB}" \"maxPlayTime\" : \"30000\",
  echo "${TAB}" "${TAB}" \"midiDeviceIn\" : \"Seeed XIAO M0\",
  echo "${TAB}" "${TAB}" \"midiDeviceOut\" : \"Seeed XIAO M0\",
  echo "${TAB}" "${TAB}" \"volume\" : \"80\"
  echo  "${TAB}" },
  ) > $_LOCAL_DIR/trackConfig.json

	debut=$2
	fin=$3
	module=1

	for((c=${debut}; c<=${fin}; c++))
	do
		echo updating module: $module
		(
			echo "${TAB}" \"computer_${c}\" : {
			echo "${TAB}" "${TAB}" \"musician\" : \"\",
			echo "${TAB}" "${TAB}" \"cueList\" : {
		) >> $_LOCAL_DIR/trackConfig.json
		for((f=0; f<${NUM_SOUND_FOLDERS}; f++))
		do
			_SOUND_FOLDER=${_SOUND_FOLDERS[$f]}
			echo UPDATING FOLDER: $_SOUND_FOLDER
			(
			echo "${TAB}" "${TAB}" "${TAB}" \"cue${f}\" : {
			echo "${TAB}" "${TAB}" "${TAB}" "${TAB}"	\"cueName\" : \"${_SOUND_FOLDER}\",
				)  >> $_LOCAL_DIR/trackConfig.json


				_SOUND_LIST=($(ls $_LOCAL_DIR/sons/${_SOUND_FOLDER}))
				NUM_SOUNDS=${#_SOUND_LIST[@]}
				echo 	SOUND NUMBER: $NUM_SOUNDS
				declare -a TRIGGERS=()
				declare -a SOUNDS=()
				declare -a GOOD_TRIGGERS=("s" "n" "c" "so" "se" "no" "ne")

				re='^[0-9]+$'
				for sound in "${_SOUND_LIST[@]}"; do
					IFS='.' read -ra SOUND_STRINGS <<< "$sound"
					IFS='-' read -ra ADDR <<< "${SOUND_STRINGS[0]}"
					trig=$(echo "${ADDR[1]}" | tr '[:upper:]' '[:lower:]')
					if ! [[ ${GOOD_TRIGGERS[*]} =~ "$trig" ]]; then
						echo SOUND $sound has wrong trigger: $trig, trigger must be
						for t in "${GOOD_TRIGGERS[@]}";do echo $t;done
						exit 1
					fi
					if ! [[ "${ADDR[2]}" =~ $re ]] ; then
						trig2=$(echo "${ADDR[2]}" | tr '[:upper:]' '[:lower:]')
						if ! [[ ${GOOD_TRIGGERS[*]} =~ "$trig" ]]; then
							echo SOUND $sound has wrong trigger: $trig, trigger must be
							for t in "${GOOD_TRIGGERS[@]}";do echo $t;done
							exit 1
						fi
					if [[ "${ADDR[3]}" =~ $re ]] ; then
						sound_module="${ADDR[3]}"
					else echo wrong or missing module number
					fi
						trig=${trig}${trig2}
					else
						if [[ "${ADDR[2]}" =~ $re ]] ; then
							sound_module="${ADDR[2]}"
						else echo wrong or missing module number
						fi
					fi
					#remove leading zero
					sound_module=$(sed 's/^0*//'<<< $sound_module)
					if [[ $sound_module == $module ]]; then
						if ! [[  "${TRIGGERS[*]}" == *" ${trig} "* ]]; then
							TRIGGERS+=("${trig}")
							SOUNDS+=("${sound}")
						fi
#					if [[ $sound_module == $module ]]; then
						echo $_COPY_COMMAND --relative $_LOCAL_DIR/sons/./$_SOUND_FOLDER/$sound $_ADDRESS_HEADER.$c:$_DISTANT_DIR/sons/
						$_COPY_COMMAND --relative $_LOCAL_DIR/sons/./$_SOUND_FOLDER/$sound $_ADDRESS_HEADER.$c:$_DISTANT_DIR/sons/
					fi
				done
#				(
				echo \"triggers\": \""${TRIGGERS[@]}"\"
#				)   >> $_LOCAL_DIR/trackConfig.json
				for((s=0; s<${#TRIGGERS[@]}; s++)); do
						samplerNum=$((s+1))
					(
						echo "${TAB}" "${TAB}" "${TAB}" "${TAB}" \"sampler${samplerNum}\" : {
						echo "${TAB}" "${TAB}" "${TAB}" "${TAB}"  "${TAB}" \"trigger\" :	\"${TRIGGERS[s]}\",
						echo "${TAB}" "${TAB}" "${TAB}" "${TAB}"  "${TAB}" \"son\" :	\"${SOUNDS[s]}\",
						echo "${TAB}" "${TAB}" "${TAB}" "${TAB}"  "${TAB}" \"playMode\" : \"latch\",
						echo "${TAB}" "${TAB}" "${TAB}" "${TAB}"  "${TAB}" \"fadeIn\" : \"0\",
						echo "${TAB}" "${TAB}" "${TAB}" "${TAB}"  "${TAB}" \"fadeOut\" : \"2000\",
						echo "${TAB}" "${TAB}" "${TAB}" "${TAB}"  "${TAB}" \"loop\" : \"1\",
						echo "${TAB}" "${TAB}" "${TAB}" "${TAB}"  "${TAB}" \"gain\" : \"100\",
						echo "${TAB}" "${TAB}" "${TAB}" "${TAB}"  "${TAB}" \"onset\" : \"0\"
						echo "${TAB}" "${TAB}" "${TAB}" "${TAB}" },
					) >>  $_LOCAL_DIR/trackConfig.json
# close cue
				done
				(
				echo "${TAB}" "${TAB}" "${TAB}"},
				) >>  $_LOCAL_DIR/trackConfig.json

		done
# close cue_list
		(
			echo "${TAB}" "${TAB}"}
			)  >>  $_LOCAL_DIR/trackConfig.json
# close computer_number
		(
			echo "${TAB}" "${TAB}"},
			)  >>  $_LOCAL_DIR/trackConfig.json

	module=$((module+1))

	done
	(
		echo "${TAB}"}
		echo }
		)  >>  $_LOCAL_DIR/trackConfig.json

	for((c=${debut}; c<=${fin}; c++))
	do
echo $_COPY_COMMAND $_LOCAL_DIR/trackConfig.json $_ADDRESS_HEADER.$c:$_DISTANT_DIR
$_COPY_COMMAND $_LOCAL_DIR/trackConfig.json $_ADDRESS_HEADER.$c:$_DISTANT_DIR
done
else
	 echo "usage: _update_sound.sh <composition name> <first raspberry number> <last raspberry number>\n
	 eg: _update_track.sh nuageAmoureux 49 64"
fi

# sshpass permet de se log à distance (-pmotdepasse)
# $1 est l'adresse locale du fichier à copier
# $2 et $3 indiquent les n° des raspberry
