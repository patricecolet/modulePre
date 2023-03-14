#!/bin/bash
mv /etc/dhcp/dhcpd.conf /etc/dhcp/dhcpd.conf.old
(
echo '# dhcpd.conf'
echo '#'
echo '# Sample configuration file for ISC dhcpd'
echo '#'
echo '# Attention: If /etc/ltsp/dhcpd.conf exists, that will be used as'
echo '# configuration file instead of this file.'
echo '#'
echo
echo '# option definitions common to all supported networks...'
echo '# option domain-name "example.org";'
echo '# option domain-name-servers ns1.example.org, ns2.example.org;'
echo
echo 'default-lease-time 600;'
echo 'max-lease-time 7200;'
echo
echo 'option subnet-mask 255.255.255.0;'
echo 'option broadcast-address 192.168.1.255;'
echo 'option routers 192.168.1.1;'
echo 'option domain-name-servers 192.168.1.250;'
echo 'option domain-name "cirm.net";'
echo
echo 'subnet 192.168.1.0 netmask 255.255.255.0 {'
echo '    range 192.168.1.3 192.168.1.254;')> "tempfile";


SCRIPT_PATH=`readlink -f ${BASH_SOURCE:-$0}`;
CONFIG_DIR=$(dirname $(dirname $(dirname "$SCRIPT_PATH")));

computerConfig=$(cat $CONFIG_DIR/config.json | jq '.computerInfo');
computerNumber=`echo $computerConfig | jq 'length'`;
echo "$computerNumber computer entries in config file";

declare -i x=$computerNumber-1;

for i in $( eval echo {0..$x} )
do
  mac=$(echo $computerConfig | jq -r --argjson n $i '.[$n] | .macAddress' | tr 'a-z' 'A-Z');
  ip=$(echo $computerConfig | jq -r --argjson n $i '.[$n] | .ipAddress');
  hostnumber=`echo $ip | sed -r 's!/.*!!; s!.*\.!!'`
  hostname=rasp$hostnumber
  (
  echo '    host 'rasp$hostnumber {
  echo '        'hardware ethernet $mac';'
  echo '        'fixed-address $ip';'
  echo  '   '}
  )>> "tempfile"
done

(
echo
echo '    host EAP1 {'
echo '        hardware ethernet 50:C7:BF:43:87:0E;'
echo '        fixed-address 192.168.1.200;'
echo '    }'
echo '    host EAP2 {'
echo '        hardware ethernet 50:C7:BF:24:A1:D8;'
echo '        fixed-address 192.168.1.201;'
echo '    }'
echo '}'
echo
echo '# The ddns-updates-style parameter controls whether or not the server will'
echo '# attempt to do a DNS update when a lease is confirmed. We default to the'
echo "# behavior of the version 2 packages ('none', since DHCP v2 didn't'"
echo '# have support for DDNS.)'
echo 'ddns-update-style none;'
echo
echo '# If this DHCP server is the official DHCP server for the local'
echo '# network, the authoritative directive should be uncommented.'
echo '#authoritative;'
echo
echo '# Use this to send dhcp log messages to a different log file (you also'
echo '# have to hack syslog.conf to complete the redirection).'
echo '#log-facility local7;'
echo


)>> "tempfile"

cp tempfile /etc/dhcp/dhcpd.conf
service isc-dhcp-server restart
