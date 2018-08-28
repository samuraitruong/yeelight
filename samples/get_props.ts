import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { DevicePropery } from "../src/models/enums";
import { Yeeligt } from "../src/yeelight";
import * as logger from "./../src/logger";

const discover = new Discover({ port: 1982, host: "", asPromise: true, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    logger.info("found device: ", device);
    const yeelight = new Yeeligt({ lightIp: device.host, lightPort: device.port });

    yeelight.on("connected", () => {
        yeelight.getProperty([DevicePropery.BRIGHT, DevicePropery.POWER]);
    });
    yeelight.connect();
});

discover.start();