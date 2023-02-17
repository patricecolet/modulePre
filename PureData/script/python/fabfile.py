from fabric.api import *

import json

user = "pi"
env.password = 'raspberry'
env.hosts = []
with open('../../../config.json', 'r') as fcc_file:
    fcc_data = json.load(fcc_file)
    for computerInfo in fcc_data["computerInfo"]:
        host = user + "@" + computerInfo["ipAddress"]
        env.hosts.append(host)

@parallel
def cmd(command):
    sudo(command)
