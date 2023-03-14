#!/bin/bash

# get script path
_DIR=$(dirname "$0");
# get absolute script path
_DIR=$(readlink -f "$_DIR")
# get modulePre root path
_DIR=$(dirname $(dirname $_DIR));

dir=$_DIR/PureData/compositions/$1/sons

mkdir $dir/temp
if ! [ -z "$1" ]
then

#shopt -s nullglob # enable nullglob
for f in $dir/*.*; do
  g=${f%.*}.wav
   ffmpeg -i "$f" -ar 48000 "$dir/temp/${g##*/}";
done
#shopt -u nullglob # disable nullglob
rm $dir/*.wav
mv $dir/temp/* $dir
rm -r $dir/temp
else

	 echo "usage: _convertToWav48khz <composition>\n
eg: _convertToWav48khz skini"
fi
