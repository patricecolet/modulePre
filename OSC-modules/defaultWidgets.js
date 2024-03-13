module.exports = function (machines,moduleStates,title) {
    receive('/NOTIFY', 'hand', "loading default widgets");
    let widgets = []
    let awakeModuleNumber = 0;
    const alive = 1;
    const dead = 0;
    let id = [];
    let ip = [];
    moduleStates.forEach((p, i) => {
        if (p.state === alive) {
            awakeModuleNumber += 1;
            id.push(machines[i].machineId);
            ip.push("\"" + machines[i].ipAddress + "\"");
        }
    });
    if (awakeModuleNumber > 0) {
        let mixerWidth = Math.min(awakeModuleNumber * 60, 960);
        let mixerHeight = 280 * Math.trunc(awakeModuleNumber / 16);
        let masterLeft = mixerWidth + 30;
        widgets.push(
            {
                "type": "text",
                "top": 5,
                "left": 10,
                "id": title + "Title",
                "width": mixerWidth,
                "height": 20,
                "value": title
            },
            {
                "type": "matrix",
                "top": 20,
                "left": 10,
                "id": title + "Matrix",
                "width": Math.min(awakeModuleNumber * 60, 960),
                "height": mixerHeight,
                "layout": "grid",
                "gridTemplate": 16,
                "innerPadding": false,
                "variables": "@{parent.variables}",
                "traversing": false,
                "widgetType": "fragment",
                "quantity": awakeModuleNumber,
                "props": "JS{{\n\
                        let p = {};\n\
                        p.file=\"open-stage-control/sessions/channelStrip.json\";\n\
                        let id=["+ id + "];\n\
                        let ip=["+ ip + "];\n\
                        let v={};\n\
                        let pr={};\n\
                        v.module=id[$];\n\
                        v.ip=ip[$];\n\
                        v.name=\""+ title + "\";\n\
                        pr.variables = v;\n\
                        p.props = pr;\n\
                        return p}}"
            },
            {
                "type": "text",
                "top": 10,
                "left": masterLeft,
                "id": "MasterTitle",
                "width": 60,
                "height": 30,
                "value": "Master"
            },
            {
                "type": "fader",
                "top": 40,
                "left": masterLeft,
                "id": "MasterFader",
                "width": 60,
                "height": 470,
                "design": "compact",
                "range": "{\"min\": {\"-inf\": 0},\
                        \"25%\": 50,\"50%\": 80,\"75%\": 100,\
                        \"max\": {\"+inf\": 127}}",
                "decimals": 0,
                "default": 100,
                "target": "localhost:4000",
                "address": "/broadcast",
                "preArgs": "/volume",
                "onValue": "setVar('" + "MasterValue'\
                        ,'level', value)",
            },
            {
                "type": "text",
                "top": 510,
                "left": masterLeft,
                "id": "MasterValue",
                "width": 60,
                "height": 30,
                "decimals": 0,

                "value": "VAR{level,100}"
            },
            {
                "type": "button",
                "top": 540,
                "left": masterLeft,
                "id": "MasterMute",
                "width": 60,
                "height": 30,
                "label": "mute",
                "mode": "toggle",
                "colorFill": "red",
                "alphaFillOff": 0.3,
                "alphaFillOn": 1,
                "target": "localhost:4000",
                "address": "/broadcast",
                "preArgs": "/mute"
            });
        receive('/NOTIFY', 'hand', "default interface: "
            + awakeModuleNumber + " modules");
    }
    return widgets;
}
