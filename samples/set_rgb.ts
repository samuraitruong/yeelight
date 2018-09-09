import { Discover } from "../src/discover";
import { Color } from "../src/models/color";
import { IDevice } from "../src/models/device";
import { Yeelight } from "../src/yeelight";
import { logger } from ".//logger";

const discover = new Discover({ port: 1982, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port });
    yeelight.on("connected", () => {
        yeelight.setRGB(new Color(1, 254, 1), "smooth", 5000);
    });
    yeelight.on("set_rgb", yeelight.disconnect);
    yeelight.connect();
});

discover.start();