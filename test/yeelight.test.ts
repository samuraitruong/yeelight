import { expect } from "chai";
import "mocha";
import { assert as SinonAssert, spy } from "sinon";
import {
    AdjustType,
    Color,
    ColorScene,
    Command,
    CommandType,
    DevicePropery,
    FlowState,
    IConfig,
} from "../src/models";
import { Yeelight } from "../src/yeelight";
import { TestUtils } from "./test-util";
/* tslint:disable:only-arrow-functions */
describe("Yeelight Class Test", () => {
    const options: IConfig = { lightIp: "127.0.0.1", lightPort: 55443, timeout: 2000 };
    beforeEach(TestUtils.beforeEach);
    afterEach(TestUtils.afterEach);
    it("connect() should success", async () => {
        const yeelight = new Yeelight(options);
        const y = await yeelight.connect();
        expect(y).not.eq(null);
        expect(y.connected).to.eq(true);
        y.disconnect();
    });
    describe("setName() tests", function() {
        this.retries(3);
        it("setName() should work when send valid message", async () => {
            options.lightPort = TestUtils.port;
            const yeelight = new Yeelight(options);
            yeelight.disablePing = true;
            const y = await yeelight.connect();
            TestUtils.mockSocket({ id: 1, result: ["ok"] }, (x) => {
                expect(x).to.deep.eq({
                    id: 1, method: "set_name", params: ["unit_test"],
                });
            });

            const result = await y.setName("unit_test");
            expect(result).to.not.eq(null);
            yeelight.disconnect();
        });

        it("setName() should fire commandSuccess, set_name, set_name_sent event", async () => {
            const yeelight = new Yeelight(options);
            yeelight.disablePing = true;
            options.lightPort = TestUtils.port;
            const y = await yeelight.connect();
            const expectData = {
                action: "set_name",
                command: new Command(1, CommandType.SET_NAME, ["unit_test"]),
                result: { id: 1, result: ["ok"] },
                success: true,
            };

            const spy1 = spy();
            const spy2 = spy();
            const spy3 = spy();

            y.once("set_name", spy1);
            y.once("commandSuccess", spy2);
            y.once("set_name_sent", spy3);
            TestUtils.mockSocket({ id: 1, result: ["ok"] }, (x) => {
                expect(x).to.deep.eq({
                    id: 1, method: "set_name", params: ["unit_test"],
                });
            });

            const result = await y.setName("unit_test");

            expect({ ...result }).to.deep.equal(expectData);
            SinonAssert.calledWith(spy1, expectData);
            SinonAssert.calledWith(spy2, expectData);
            SinonAssert.calledWith(spy3, expectData.command);
            yeelight.disconnect();
        });

        // tslint:disable-next-line:max-line-length
        it("setName() should fire error when send invalid name, should fire set_name, commandError, set_name_sent events",
            async () => {
                const yeelight = new Yeelight(options);
                yeelight.disablePing = true;
                options.lightPort = TestUtils.port;
                const y = await yeelight.connect();
                const expectData1 = {
                    action: "set_name",
                    command: new Command(1, CommandType.SET_NAME, ["this is invalid name"]),
                    result: { id: 1, error: { code: -1, message: "General error" } },
                    success: false,
                };

                const spy1 = spy();
                const spy2 = spy();
                const spy3 = spy();

                y.once("set_name", spy1);
                y.once("commandError", spy2);
                y.once("set_name_sent", spy3);
                TestUtils.mockSocket({ id: 1, error: { code: -1, message: "General error" } }, (x) => {
                    expect(x).to.deep.eq({
                        id: 1, method: "set_name", params: ["this is invalid name"],
                    });
                });

                let result = null;
                let errResult;
                try {
                    result = await y.setName("this is invalid name");
                } catch (error) {
                    errResult = error;
                }

                expect(result).to.be.equal(null);

                expect({ ...errResult }).to.deep.equal(expectData1);
                SinonAssert.calledWith(spy1, expectData1);
                SinonAssert.calledWith(spy2, expectData1);
                SinonAssert.calledWith(spy3, expectData1.command);
                yeelight.disconnect();
            });
        it("setName() should reject promise, raise commandTimedout event when socket not response",
            async () => {
                const yeelight = new Yeelight(options);
                yeelight.disablePing = true;
                options.lightPort = TestUtils.port;
                const y = await yeelight.connect();
                const expectData = {
                    action: "set_name",
                    command: new Command(1, CommandType.SET_NAME, ["mybulb"]),
                    success: false,
                };

                const spy2 = spy();
                const spy3 = spy();

                y.once("commandTimedout", spy2);
                y.once("set_name_sent", spy3);
                TestUtils.mockSocket(null, (x) => {
                    expect(x).to.deep.eq({
                        id: 1, method: "set_name", params: ["mybulb"],
                    });
                });
                try {
                    const result = await y.setName("mybulb");
                } catch (err) {
                    // promise will reject on timeout
                }
                SinonAssert.calledWith(spy2, expectData.command);
                SinonAssert.calledWith(spy3, expectData.command);
                yeelight.disconnect();
            });
    });

    describe("manipulator methods", function() {
        async function init() {
            const yeelight = new Yeelight(options);
            yeelight.disablePing = true;
            await yeelight.connect();
            return yeelight;
        }

        function removeClasses<T>(o: T): T {
            return JSON.parse(JSON.stringify(o));
        }

        function testMethod(
            methodName: string,
            fcn: (yeelight: Yeelight) => any,
            sendData: any,
            replyData: any,
            verifyReply?: any,
        ) {

            it("method " + methodName + " should work when send valid message", async () => {
                const yeelight = await init();

                TestUtils.mockSocket(replyData.result, (x) => {
                    expect(x).to.deep.eq(sendData);
                });

                let result = await fcn(yeelight);
                const reply = (
                    verifyReply === undefined ?
                    replyData :
                    verifyReply
                );
                if (result) {
                    result = removeClasses(result);
                }
                expect(result).to.deep.eq(reply);
                yeelight.disconnect();
            });
        }
        testMethod(
            "toggle",
            (yeelight) => yeelight.toggle(),
            { id: 1, method: "toggle", params: [] },
            {
                action: "toggle",
                command: { id: 1, method: "toggle", params: [] },
                result: { id: 1, result: [ "ok" ] },
                success: true,
            },
        );
        testMethod(
            "cronAdd",
            (yeelight) => yeelight.cronAdd(0, 1),
            { id: 1, method: "cron_add", params: [ 0, 1 ] },
            {
                action: "cron_add",
                command: { id: 1, method: "cron_add", params: [ 0, 1 ] },
                result: { id: 1, result: [ "ok" ] },
                success: true,
            },
        );
        testMethod(
            "cronGet",
            (yeelight) => yeelight.cronGet(0),
            { id: 1, method: "cron_get", params: [ 0 ] },
            {
                action: "cron_get",
                command: { id: 1, method: "cron_get", params: [ 0 ] },
                result: { id: 1, result: [ null ] },
                success: true,
            },
        );
        testMethod(
            "cronDelete",
            (yeelight) => yeelight.cronDelete(0),
            { id: 1, method: "cron_del", params: [ 0 ] },
            {
                action: "cron_del",
                command: { id: 1, method: "cron_del", params: [ 0 ] },
                result: { id: 1, result: [ "ok" ] },
                success: true },
        );
        testMethod(
            "setDefault",
            (yeelight) => yeelight.setDefault(),
            { id: 1, method: "set_default", params: [] },
            {
                action: "set_default",
                command: { id: 1, method: "set_default", params: [] },
                result: { id: 1, result: [ "ok" ] },
                success: true },
        );
        testMethod(
            "startColorFlow",
            (yeelight) => {
                return yeelight.startColorFlow([
                    new FlowState(500, 1, new Color(1, 254, 1).getValue(), 1),
                    new FlowState(500, 1, new Color(255, 0, 0).getValue(), 1),
                    new FlowState(500, 1, new Color(0, 0, 255).getValue(), 1),
                ]);
            },
            {
                id: 1,
                method: "start_cf",
                params: [ 0, 1, "500,1,130561,1,500,1,16711680,1,500,1,255,1" ],
            },
            {
                action: "start_cf",
                command:
                {
                    id: 1,
                    method: "start_cf",
                    params: [ 0, 1, "500,1,130561,1,500,1,16711680,1,500,1,255,1" ] },
                result: { id: 1, result: [ "ok" ] },
                success: true,
            },
        );
        testMethod(
            "stopColorFlow",
            (yeelight) => yeelight.stopColorFlow(),
            { id: 1, method: "stop_cf", params: [] },
            {
                action: "stop_cf",
                command: { id: 1, method: "stop_cf", params: [] },
                result: { id: 1, result: [ "ok" ] },
                success: true,
            },
        );
        testMethod(
            "getProperty",
            (yeelight) => yeelight.getProperty([DevicePropery.BRIGHT, DevicePropery.POWER]),
            { id: 1, method: "get_prop", params: [ "bright", "power" ] },
            {
                action: "get_prop",
                command: { id: 1, method: "get_prop", params: [ "bright", "power" ] },
                result: { id: 1, result: [ "1", "off" ] },
                success: true,
            },
        );
        testMethod(
            "setCtAbx",
            (yeelight) => yeelight.setCtAbx(2234, "smooth"),
            { id: 1, method: "set_ct_abx", params: [ 2234, "smooth", 500 ] },
            {
                action: "set_ct_abx",
                command: { id: 1, method: "set_ct_abx", params: [ 2234, "smooth", 500 ] },
                result: { id: 1, result: [ "ok" ] },
                success: true,
            },
        );
        testMethod(
            "setRGB",
            (yeelight) => yeelight.setRGB(new Color(0, 0, 255), "smooth"),
            { id: 1, method: "set_rgb", params: [ 255, "smooth", 500 ] },
            {
                action: "set_rgb",
                command: { id: 1, method: "set_rgb", params: [ 255, "smooth", 500 ] },
                result: { id: 1, result: [ "ok" ] },
                success: true,
            },
        );
        testMethod(
            "setHSV",
            (yeelight) => yeelight.setHSV(240, 100, "smooth"),
            {
                id: 1,
                method: "set_hsv",
                params: [ 240, 100, "smooth", 500 ],
            },
            {
                action: "set_hsv",
                command:
                {
                    id: 1,
                    method: "set_hsv",
                    params: [ 240, 100, "smooth", 500 ] },
                result: { id: 1, result: [ "ok" ] },
                success: true,
            },
        );
        testMethod(
            "setBright",
            (yeelight) => yeelight.setBright(1),
            { id: 1, method: "set_bright", params: [ 1, "sudden", 500 ] },
            {
                action: "set_bright",
                command: { id: 1, method: "set_bright", params: [ 1, "sudden", 500 ] },
                result: { id: 1, result: [ "ok" ] },
                success: true,
            },
        );
        testMethod(
            "setAdjust",
            (yeelight) => yeelight.setAdjust(AdjustType.INCREASE, "bright"),
            {
                id: 1,
                method: "set_adjust",
                params: [ "increase", "bright" ],
            },
            {
                action: "set_adjust",
                command: { id: 1, method: "set_adjust", params: [ "increase", "bright" ] },
                result: { id: 1, result: [ "ok" ] },
                success: true,
            },
        );
        testMethod(
            "setName",
            (yeelight) => yeelight.setName("new_name"),
            { id: 1, method: "set_name", params: [ "new_name" ] },
            {
                action: "set_name",
                command: { id: 1, method: "set_name", params: [ "new_name" ] },
                result: { id: 1, result: [ "ok" ] },
                success: true,
            },
        );
        testMethod(
            "adjust",
            (yeelight) => yeelight.adjust(CommandType.ADJUST_BRIGHT, 5),
            { id: 1, method: "adjust_bright", params: [ 5, 500 ] },
            {
                action: "adjust_bright",
                command: { id: 1, method: "adjust_bright", params: [ 5, 500 ] },
                result: { id: 1, result: [ "ok" ] },
                success: true,
            },
        );
        testMethod(
            "ping",
            (yeelight) => yeelight.ping(),
            { id: 1, method: "ping", params: [] },
            {
                action: "ping",
                command: { id: 1, method: "ping", params: [] },
                result: { id: 1, error:{code: -1, message: "method not supported"} },
                success: false,
            },
            null,
        );
        testMethod(
            "setScene",
            (yeelight) => yeelight.setScene(new ColorScene(new Color(1, 254, 1), 1)),
            { id: 1, method: "set_scene", params: [ "color", 130561, 1 ] },
            {
                action: "set_scene",
                command: { id: 1, method: "set_scene", params: [ "color", 130561, 1 ] },
                result: { id: 1, result: [ "ok" ] },
                success: true,
            },
        );

        testMethod(
            "setMusic",
            (yeelight) => yeelight.setMusic(1, "10.0.1.20", 80),
            { id: 1, method: "set_music", params: [ "10.0.1.20", 80 ] },
            {
                action: "set_music",
                command: { id: 1, method: "set_music", params: [ "10.0.1.20", 80 ] },
                result: { id: 1, result: [ "ok" ] },
                success: true,
            },
        );
    });

});
