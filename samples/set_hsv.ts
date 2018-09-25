import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { Yeelight } from "../src/yeelight";
import { logger } from ".//logger";

const discover = new Discover({ port: 1982, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    discover.destroy();
    const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port });
    yeelight.on("connected", () => {
        yeelight.setHSV(307, 73, "smooth", 5000);
    });
    yeelight.on("set_hsv", yeelight.disconnect);
    yeelight.connect();
});

discover.start();