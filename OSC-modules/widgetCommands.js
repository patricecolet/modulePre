module.exports = function (machines,data,moduleStates,projectPath) {
    // enable debug message to client
    const debugState = 1;
    function debug(message) {
        if (debugState) console.log('DEBUG', message);
    }
    debug('projectPath: ' + projectPath)
    const process = nativeRequire('child_process');
    const fs = nativeRequire('fs');
    const readdir  = fs.promises;
    const path = nativeRequire('path');
    const crypto = nativeRequire('crypto');
    //get composition configuration    
    const compoConfig = projectPath + "/trackConfig.json";
    let trackConfig = loadJSON(compoConfig);
    // get files with matching extension
    // @param dir: path to search in
    // @param ext: extension without dot to filter
    const searchFilesByExtension = async (dir, ext) => {
        const matchedFiles = [];
        fs.readdirSync(dir).forEach(file => {
            const fileExt = path.extname(file);
            if (fileExt === `.${ext}`) {
                matchedFiles.push(file);
            }    
        })
        return matchedFiles;
    };
    
    
    // get list of folders in directory
    //@param path: path to search in
    async function listDirectories(path) {
        const directories = (await readdir(path, {withFileTypes: true}))
        .filter(dirent => dirent.isDirectory())
        .map(dir => dir.name);  
        return directories;
    }
    // create hash from file
    function getFileHash(file) {
        const fileBuffer = fs.readFileSync(file);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const hex = hashSum.digest('hex');
        return hex
    }
    function removeListItem (list,item) {
        let newList = []
        for (let i = 0; i < list.length; i++) {
            if (list[i] !== item) {
                newList.push(list[i]);
            }
        }
    }
    ///////////////////////////////////////////////////
    // Reads OSC message, extract value
    // eval message and parse commands from interface
    //////////////////////////////////////////////////
    // extract parameters from OSC data  
    var { address, args, host, port, clientId } = data;
    
    // get OSC message
    try {const val = args[0].value}
    catch (e) {
        receive('/NOTIFY', 'triangle-exclamation', address + " error:\n" + e.message);
        err += title + ": " + e.message + "\n";
    }
    
    // TODO: use 'switch/case' instead of 'if' for a faster and safer process
    // save content of trackConfig variable into a json file located in composition directory
    if (address === '/saveTrackConfig') {
        let val = JSON.parse(args[0].value)
        const trackName = val.name
        try {
            fs.writeFileSync('../PureData/compositions/' + trackName + '/trackConfig.json', JSON.stringify(val, null, 4));
            debug(trackName + " Config written!");
        }
        catch(e) {
            debug(trackName + " Config error:" + e);
        }
        moduleStates.forEach((m,i) => {
            if (m.state === 1) {
                const id = machines[i].machineId
                debug('upload ' + trackName + ' trackConfig to: ' + id)
                process.exec('../PureData/script/_update_trackConfig.sh ' +  trackName + ' ' + id + ' ' + id,
                function (err, stdout, stderr) {
                    if (err) {
                        console.log('upload command stdout error' + err);
                    }
                    debug('upload command stdout', stdout);
                }
                );
            }
        })    
    }
    if (address === '/mute') {
        machines.forEach((p, i) => {
            let m = moduleStates[i];
            if (m.solo === 0) {
                moduleStates[i].mute = val;
            }
        });
    }
    if (address === '/solo') {
        let solo = 0;
        moduleStates.forEach((m, i) => {
            solo += m.solo;
        });
        machines.forEach((machine, i) => {
            let m = moduleStates[i];
            let ip = machine.ipAddress;
            if (m.state) {
                if (m.mute === 0 && m.solo === 0 && host != ip && solo < 1) {
                    send(ip, "4000", "/mute", val);
                }
                if (ip === host) {
                    debug( "soloState " + solo);
                    if ((val === 0) && ((m.mute === 1) || (solo > 0))) send(ip, "4000", "/mute", 1);
                    if (val === 1) send(ip, "4000", "/mute", 0);
                    m.solo = val;
                }
            }
        });
    }
    if (address === '/sampleListingFolder') {
        const soundDir = projectPath + "/" + trackConfig.globalSettings.soundPath
        let samples = {};
        const samplesFolder = args[0].value
        let samplesPath = "" 
        let samplesHeight = 30;
        let samplesNumber = 1;
        let folders = {};
        fs.readdirSync(soundDir).forEach(function(file) {
            let filePath = soundDir + '/' + file;
            let stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) folders[file] = file;
        });
        if (samplesFolder) samplesPath = soundDir + '/' + samplesFolder
        else {
            if (folders) samplesPath = soundDir + '/' + Object.keys(folders)[0]
        }
        samples["_NO SAMPLE"] = "_NO SAMPLE";
        if (samplesPath) {
            fs.readdirSync(samplesPath).forEach(function(file) {
                //debug('sample: ' + file)
                const filePath = samplesPath + '/' + file;;
                const stat = fs.statSync(filePath);
                if (stat && stat.isDirectory()) debug('is directory')
                else {
                    if (path.extname(file) === ".wav") {
                        samples[file] = file;
                        samplesNumber = samplesNumber + 1;
                    }
                }
            });
            samplesHeight = Math.ceil(samplesNumber / 3) * 30;
//        debug('samples list height: ' + samplesHeight)
            debug('sample folders: ' + folders)
            receive(
                '/EDIT','samplesListing',{
                    "props": { 
                        "variables" : { 
                            "sampleFolders": folders,
                            "samples": samples,
                            "samplesHeight" : samplesHeight,
                            "currentFolder" : samplesFolder
                        }
                    }
                }
                , { clientId: clientId } 
                )
            }
        }
        if (address === '/addSampleFolder') {
            const folderPath = args[0].value;
            searchFilesByExtension(folderPath,'wav').then((files) => {
                const folder = path.basename(path.resolve(folderPath));
                const soundPath = trackConfig.globalSettings.soundPath;
                const sampleFolderPath = projectPath + '/' + soundPath + '/' + folder;
                debug('addSampleFolder: ' + sampleFolderPath)
                if (!fs.existsSync(sampleFolderPath)){
                    fs.mkdirSync(sampleFolderPath);
                }
                files.forEach(file => {
                    const destFilePath = sampleFolderPath + '/' + file
                    fs.copyFileSync(folderPath + '/' + file, destFilePath);
                    const hash = getFileHash(destFilePath)
                    fs.writeFile(sampleFolderPath + '/' + file + '.hash', hash, err => {
                        if (err) {
                            debug('error ' + err)
                        } else {
                            // file written successfully
                        }
                    });
                });
            });
        }
        if (address === '/delSampleFolder') {
            const sampleFolder = args[0].value;
            const soundPath = projectPath + '/' + trackConfig.globalSettings.soundPath;
            const sampleFolderPath = soundPath + '/' + sampleFolder;
            fs.rm(sampleFolderPath, { recursive: true, force: true }, err => {
                if (err) {
                    throw err;
                }
            }) 
            debug('removed:' + sampleFolder); 
            listDirectories(soundPath).then(folders => {
                debug('setting default: ' + folders);
                const newFolders = removeListItem (folders,sampleFolder) 
                const files = searchFilesByExtension( soundPath + ' ' + folders[0],'wav')
                receive('/EDIT', "samplesListing", { "props": {"variables": {'sampleFolders' : newFolders, 'samples' : files}}}, { clientId: clientId });
                receive('/EDIT', "sampleListingFolder", { "value":  folders[0] }, { clientId: clientId });
            });
        }
        if (address === '/uploadSample') {
            const object = JSON.parse(args[0].value);
            const sampleDir = trackConfig.modules[object.moduleId].samples[object.sampleId].sampleDir
            const sampleName = trackConfig.modules[object.moduleId].samples[object.sampleId].sampleName
            debug('sampleDir: ' + sampleDir)
            const samplePath = trackConfig.name + '/' + trackConfig.globalSettings.soundPath + '/' + sampleDir
            moduleStates.forEach((m,i) => {
                if (m.state === 1) {
                    debug('upload ' + samplePath + 'to: ' + machines[i].machineId)
                    const id = machines[i].machineId
                    process.exec('../PureData/script/_upload_sample.sh ' +  samplePath + ' ' + sampleName + ' ' + id + ' ' + id,
                    function (err, stdout, stderr) {
                        if (err) {
                            console.log('/NOTIFY', 'triangle-exclamation', 'error' + err);
                        }
                        debug('uploading... ' + stdout);
                    }
                    );
                }
            })
        }
        // old function to be deleted
        if (address === '/addSample') {
            let object = JSON.parse(val);
            let filename = object.path.split('/').pop();
            let destinationPath = path.join(projectPath + '/sons/' + object.moduleID + '/',filename)
            fs.copyFile(object.path,destinationPath, 
                fs.constants.COPYFILE_EXCL, (err) => {
                    if (err) {
                        receive('/NOTIFY', 'triangle-exclamation', err);
                    }});
                    debug("saved into " + destinationPath);
                    const hash = getFileHash(destinationPath)
                    debug('hash: ' + hash)
                }
                debug(" widgets commands ok " + address);
            }
