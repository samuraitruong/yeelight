import { Discover } from "../src/discover";
import { Color } from "../src/models/color";
import { IDevice } from "../src/models/device";
import { Yeeligt } from "../src/yeelight";
import * as logger from "./../src/logger";

const discover = new Discover({ port: 1982, host: "", asPromise: true, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    const yeelight = new Yeeligt({ lightIp: device.host, lightPort: device.port });
    yeelight.on("connected", () => {
        yeelight.setRGB(new Color(66, 87, 23), "smooth", 5000);
    });
    yeelight.connect();
});

discover.start();