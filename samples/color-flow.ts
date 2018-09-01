import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { StartFlowAction } from "../src/models/enums";
import { FlowState } from "../src/models/flow-state";
import { Yeeligt } from "../src/yeelight";
import { logger } from "./logger";

const discover = new Discover({ port: 1982, host: "", debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    logger.info("found device: ", device);
    const yeelight = new Yeeligt({ lightIp: device.host, lightPort: device.port });

    yeelight.on("connected", () => {
        yeelight.startColorFlow([
            new FlowState(2000, 2, 2700, 100),
            new FlowState(2000, 1, 255, 50),
            new FlowState(2000, 7, 1500, 30),
            new FlowState(2000, 2, 5000, 45),
            new FlowState(2000, 2, 3000, 25),
        ], StartFlowAction.LED_STAY);
    });
    yeelight.connect();
});

discover.start();