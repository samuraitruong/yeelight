import { Discover } from "../src/discover";
import { Color } from "../src/models/color";
import { IDevice } from "../src/models/device";
import { StartFlowAction } from "../src/models/enums";
import { FlowState } from "../src/models/flow-state";
import { CfScene, ColorScene, CtScene, HsvScene } from "../src/models/scene";
import { Yeelight } from "../src/yeelight";
import { logger } from "./logger";

const discover = new Discover({ port: 1982, debug: true }, logger);
discover.once("deviceAdded", (device: IDevice) => {
    logger.info("found device: ", device);
    const yeelight = new Yeelight({ lightIp: device.host, lightPort: device.port });

    yeelight.on("connected", () => {
        yeelight.setScene(new ColorScene(new Color(233, 66, 123), 50));
        setTimeout(() => {
            yeelight.setScene(new HsvScene(279, 80, 100));
        }, 2000);

        setTimeout(() => {
            yeelight.setScene(new CtScene(4000, 88));
        }, 4000);

        setTimeout(() => {
            yeelight.setScene(new CfScene(StartFlowAction.LED_STAY, [
                new FlowState(500, 1, 255, 100),
                new FlowState(1000, 1, 16776960, 70)
            ], 5));
        }, 6000);
    });
    yeelight.connect();
});

discover.start();