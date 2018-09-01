import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { Yeelight } from "../src/yeelight";
import { logger } from "./logger";

const discover = new Discover({ port: 1982, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port });
    yeelight.on("connected", () => {
        yeelight.setCtAbx(2234, "smooth", 5000);
    });
    yeelight.connect();
});

discover.start();