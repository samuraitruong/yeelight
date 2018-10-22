import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { Yeelight } from "../src/yeelight";
import { logger } from ".//logger";

const discover = new Discover({ port: 1982, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    discover.destroy();
    const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port });
    yeelight.on("connected", () => {
        // yeelight.setRGB(new Color(254, 254, 254), "smooth", 1000);
        yeelight.setCtAbx(5000, "sudden", 1000);
    });
    yeelight.on("set_rgb", yeelight.disconnect);
    yeelight.connect();
});

discover.start();