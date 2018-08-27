import { Discover } from "../src/discover";
import { IDevice } from "../src/models/device";
import { FlowState } from "../src/models/flow-state";
import { Yeeligt } from "../src/yeelight";
import * as logger from "./../src/logger";
import { StartFlowAction } from "../src/models/enums";

const discover = new Discover({ port: 1982, host: "", asPromise: true, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    logger.info("found device: ", device);
    const yeelight = new Yeeligt({ lightIp: device.host, lightPort: device.port });

    yeelight.on("connected", () => {
        console.log("device.status", device.status);
        // yeelight.setPower(device.status === DeviceStatus.OFF);
        yeelight.startColorFlow([
            new FlowState(2000, 2, 2700, 100),
            new FlowState(2000, 1, 255, 50),
            new FlowState(2000, 7, 0, 30),
            new FlowState(2000, 2, 5000, 45),
        ], StartFlowAction.LED_RECOVER);
    });
    yeelight.connect();
});

discover.start();