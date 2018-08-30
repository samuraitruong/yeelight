import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { Yeeligt } from "../src/yeelight";
import { logger } from "./../src/logger";

const discover = new Discover({ port: 1982, host: "", asPromise: true, debug: true }, logger);
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

discover.start();