#!/bin/bash
# On raspberry pi ,this script verify in /boot/config.txt
# if installed soundcard is the same as defined in modulePre/config.json.
# Please install jq for JSON parsing.
# patco2022

# Redirect stdout ( > ) into a named pipe ( >() ) running "tee"
exec > >(tee -i logfile.txt)
# adding stderr.
exec 2>&1

scriptPath=$(dirname "$0");

# Installing soundcord via /boot/config.txt file requires rebooting twice
# to complete soundcard configuration, we use a textfile to store the reboot status
rebootFile=$scriptPath/rebootFile;
rebootStatus=`cat $rebootFile`;

if [ $rebootStatus == 1 ];
then
	echo "reboot a second time"
	sleep  10;
	echo 0 | tee $rebootFile;
	reboot;
else

	computerConfig=$(cat $scriptPath/../../config.json | jq '.computerInfo');
	hostname=`uname -n`

	if [ $hostname == "patchbox" ];
	then
	        echo "hostname: $hostname";
	        driver=`awk -F: '/^dtoverlay/{print substr($1,RSTART+11);exit}' /boot/config.txt`;
	        echo "driver: $driver";
	        mac=`cat /sys/class/net/wlan0/address`;
	        #echo "MAC address: $mac";
	        computerNumber=`echo $computerConfig | jq 'length'`;
	        echo "$computerNumber computer entries in config file"
	        thisComputer=-1;
	        for i in $( eval echo {0..$computerNumber} )
	        do
	                if [ $mac == $(echo $computerConfig | jq -r --argjson n $i '.[$n] | .macAddress') ];
	                then 
	                        echo "$mac found in computerInfo $i";
	                        soundcard=$(echo $computerConfig | jq -r --argjson n $i '.[$n] | .soundcard');
				echo  "soundcard is $soundcard";
	                        if [ $driver == $soundcard ];
				then 
					echo "soundcard  $soundcard is already installed";
	                        	break
	                        else
					echo "installing $soundcard ...";
					sed -i "s/${driver}/${soundcard}/" /boot/config.txt;
	                                echo "rebooting...";
					echo 1 | tee $rebootFile;
					reboot;
	                        fi
	                fi 
	        done
	fi
fi
