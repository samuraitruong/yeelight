import { expect } from "chai";
import "mocha";
import { Discover } from "../src/discover";
import {
    IConfig,
} from "../src/models";
import { TestUtils } from "./test-util";
/* tslint:disable:only-arrow-functions */
describe("Discover Class Test", () => {
    const options: IConfig = { lightIp: "127.0.0.1", lightPort: 55443, timeout: 2000 };
    beforeEach(TestUtils.beforeEach);
    afterEach(TestUtils.afterEach);

    it("discover() should find bulbs", async () => {
        const discover = new Discover({
            limit: 1,
            timeout: 1000,
        });

        setTimeout(() => {
            // Mock message received:

            const message = "HTTP/1.1 200 OK\r\n\
Cache-Control: max-age=3584\r\n\
Date:\r\n\
Ext:\r\n\
Location: yeelight://192.168.0.42:55443\r\n\
Server: POSIX UPnP/1.0 YGLC/1\r\n\
id: 0x000000000af2608f\r\n\
model: color\r\n\
fw_ver: 26\r\n\
support: get_prop set_default set_power toggle set_bright start_cf \r\n\
stop_cf set_scene cron_add cron_get cron_del set_ct_abx set_rgb set_hsv \r\n\
set_adjust adjust_bright adjust_ct adjust_color set_music set\r\n\
power: on\r\n\
bright: 1\r\n\
color_mode: 1\r\n\
ct: 2234\r\n\
rgb: 65280\r\n\
hue: 240\r\n\
sat: 100\r\n\
name: new_name";
            // @ts-ignore private
            discover.onSocketMessage(
                Buffer.from(message), {
                address: "192.168.0.42",
                family: "IPv4",
                port: 49155,
                // size: message.length
            });
        }, 100);
        const devices = await discover.start();

        expect(devices.length).to.eq(1);

        expect(devices[0].id).to.eq("0x000000000af2608f");
        expect(devices[0].host).to.eq("192.168.0.42");
        expect(devices[0].port).to.eq(55443);

        discover.destroy();
    });
});
