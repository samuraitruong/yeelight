import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { DevicePropery } from "../src/models/enums";
import { Yeelight } from "../src/yeelight";
import { logger } from "./logger";

const discover = new Discover({ port: 1982, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    logger.info("found device: ", device);
    const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port });

    yeelight.on("connected", () => {
        yeelight.getProperty([DevicePropery.BRIGHT, DevicePropery.POWER]);
    });
    yeelight.connect();
});

discover.start();