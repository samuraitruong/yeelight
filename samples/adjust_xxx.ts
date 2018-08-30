import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { CommandType } from "../src/models/enums";
import { Yeeligt } from "../src/yeelight";
import { logger } from "./../src/logger";

const discover = new Discover({ port: 1982, host: "", asPromise: true, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    const yeelight = new Yeeligt({ lightIp: device.host, lightPort: device.port });

    yeelight.on("connected", () => {
        yeelight.adjust(CommandType.ADJUST_COLOR, 50, 3333);
    });
    yeelight.connect();
});

discover.start();