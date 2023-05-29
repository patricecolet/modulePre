#!/bin/bash
while [ ! -d /run/user/1000/pulse ]
do
      sleep 0.2
done
#export XDG_RUNTIME_DIR="/run/user/1000"
# Wait a while for jack to start for launching puredata
#echo '5s'
env sleep 15
#echo 'fin 5s'

SCRIPT_PATH=`readlink -f ${BASH_SOURCE:-$0}`
PD_PATCH_DIR=$(dirname $(dirname "$SCRIPT_PATH"))
CONFIG_DIR=$(dirname "$PD_PATCH_DIR")
#PureData log file
LOG_FILE=$PD_PATCH_DIR/start.log
rm $LOG_FILE

#PureData audio and midi settings are set in config.json
pdsettings=$(cat $CONFIG_DIR/config.json | jq '.pdsettings');
midiAPI=$(echo $pdsettings | jq -r '.midiAPI');
audioAPI=$(echo $pdsettings | jq -r '.audioAPI');
samplerate=$(echo $pdsettings | jq -r '.samplerate');
audiobuf=$(echo $pdsettings | jq -r '.audiobuf');
blocksize=$(echo $pdsettings | jq -r '.blocksize');
echo "$pdsettings";
# start PureData
echo "pd -nogui  -$midiAPI -$audioAPI -r $samplerate -audiobuf $audiobuf -blocksize $blocksize $PD_PATCH_DIR/_load_on_boot.pd "
pd -nogui -noadc -$midiAPI -$audioAPI -r $samplerate -audiobuf $audiobuf -blocksize $blocksize $PD_PATCH_DIR/_load_on_boot.pd >> $LOG_FILE 2>&1 &
