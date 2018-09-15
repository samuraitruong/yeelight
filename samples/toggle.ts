import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { Yeelight } from "../src/yeelight";
import { logger } from "./logger";

const discover = new Discover({ port: 1982, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    logger.info("found device: ", device);
    const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port });

    yeelight.on("connected", () => {
        console.log("device.status", device.status);
        yeelight.toggle();
        yeelight.on("commandSuccess", () => {
            yeelight.disconnect();
        });
    });
    yeelight.connect();
});

discover.start().catch((err) => console.log(err)).then(x => discover.destroy());