import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { ILogger } from "../src/models/logger";
import { Yeeligt } from "../src/yeelight";
import { logger } from "./logger";

const discover = new Discover({ port: 1982, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    logger.info("found device: ", device);
    const yeelight = new Yeeligt({ lightIp: device.host, lightPort: device.port });

    yeelight.on("connected", () => {
        console.log("device.status", device.status);
        // yeelight.setPower(device.status === DeviceStatus.OFF);
        yeelight.toggle();
    });
    yeelight.connect();
});

discover.start().catch((err) => console.log(err));