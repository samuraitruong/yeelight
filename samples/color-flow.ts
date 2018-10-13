import { Discover } from "../src/discover";
import { Color, FlowState, IDevice, StartFlowAction } from "../src/models";
import { Yeelight } from "../src/yeelight";
import { logger } from "./logger";

const discover = new Discover({ port: 1982, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    logger.info("found device: ", device);
    const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port });
    discover.destroy();
    yeelight.on("connected", () => {
        yeelight.startColorFlow([
            new FlowState(2000, 1, new Color(1, 254, 1).getValue(), 100),
            new FlowState(2000, 1, new Color(254, 153, 1).getValue(), 100),
            //new FlowState(500, 1, new Color(77, 254, 77).getValue(), 100),
            //new FlowState(500, 1, new Color(51, 254, 51).getValue(), 100),
            //new FlowState(500, 1, new Color(0, 254, 0).getValue(), 100),
            //new FlowState(500, 1, new Color(0, 204, 0).getValue(), 100),
            //new FlowState(500, 1, new Color(0, 153, 0).getValue(), 100),
            // new FlowState(500, 1, new Color(79, 183, 51).getValue(), 100),
            // new FlowState(500, 1, new Color(53, 163, 24).getValue(), 100),
            // new FlowState(500, 1, new Color(34, 150, 4).getValue(), 100),
        ], StartFlowAction.LED_RECOVER, 0);
    });
    yeelight.on("start_cf", () => yeelight.disconnect());
    yeelight.connect();
});

discover.start();