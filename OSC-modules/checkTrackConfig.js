module.exports = function (config,moduleStates,compoPath) {
    const debugState = 1;
    function debug(message) {
        if (debugState) receive('/NOTIFY', 'hand', message)
    }
    function getModuleID(ip) {
        const ipArray = ip.split(".")
        return ipArray[3];
    }
    const process = nativeRequire('child_process')
    const machines = config.computerInfo
    moduleStates.forEach((p, i) => {
        if (moduleStates[i].state === 1) {
            let moduleNum = getModuleID(machines[i].ipAddress);
            config.compositions.forEach((compo) => {
                const command = '../PureData/script/_update_trackConfig.sh ' + compo.title + ' ' + moduleNum + ' ' + moduleNum
                console.log('check TrackConfing ' + command);
                process.exec(command,
                    function (err, stdout, stderr) {
                        if (err) {
                            debug('/NOTIFY', 'triangle-exclamation', err)
                        }
                        console.log('/NOTIFY', 'hand', stdout)
                    })
                }) 
            }
        })
        
        debug("check track config ok")
    }
