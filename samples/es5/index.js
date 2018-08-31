const y = require("yeelight-awesome");
const discover = new y.Discover({
    port: 1982,
    host: "",
    debug: true
});
discover.once("deviceAdded", (device) => {
    const yeelight = new y.Yeeligt({
        lightIp: device.host,
        lightPort: device.port
    });

    yeelight.on("connected", () => {
        yeelight.setRGB(new y.Color(123, 99, 65), "smooth", 5000);
    });
    yeelight.connect();
});

discover.start();