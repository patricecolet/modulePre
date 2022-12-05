#!/bin/sh

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

TEMP_FILE=$SCRIPT_DIR/temp

echo "" > $SCRIPT_DIR/temp

echo "$(ls | grep .wav )"  >> $SCRIPT_DIR/temp
#sed -i  '' 's/$/;/' $TEMP_FILE
echo "done"
