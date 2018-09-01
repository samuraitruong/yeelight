const y = require("yeelight-awesome");
const discover = new y.Discover({
    debug: true
});

discover.start().then(devices => {
    discover.destroy();
    const device = devices[0];
    const yeelight = new y.Yeeligt({
        lightIp: device.host,
        lightPort: device.port
    });
    yeelight.connect().then(x => {
        yeelight.setRGB(new y.Color(99, 22, 222), "smooth", 2300).then(() => {
            yeelight.disconnect();
        });
    });
});