import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { CommandType } from "../src/models/enums";
import { Yeelight } from "../src/yeelight";
import { logger } from "./logger";

const discover = new Discover({ port: 1982, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port });

    yeelight.on("connected", () => {
        yeelight.adjust(CommandType.ADJUST_COLOR, 50, 3333);
    });
    yeelight.connect();
});

discover.start();