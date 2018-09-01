import { Discover } from "../src/discover";
import { Color } from "../src/models/color";
import { IDevice } from "../src/models/device";
import { Yeeligt } from "../src/yeelight";
import { logger } from "./../src/logger";

const discover = new Discover({ port: 1982, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    const yeelight = new Yeeligt({ lightIp: device.host, lightPort: device.port });
    yeelight.on("connected", () => {
        yeelight.setBright(88, "smooth", 1000);
    });
    yeelight.connect();
});

discover.start();