import { createServer, Server, Socket } from "net";
let server: Server;
let socket: Socket;
let data: any = {};
let validateFunc: (incommingData: any) => void;
export class TestUtils {
    public static port = 55443;
    public static beforeEach(done: () => void) {
        const me = TestUtils;
        server = createServer((s: Socket) => {
            socket = s;
            if (data != null) {
                socket.write(JSON.stringify(data));
                socket.once("data", (incomming) => {
                    validateFunc(JSON.parse(incomming.toString()));
                });
            }
            // socket.pipe(socket);
        });
        server.on("connection", (s) => socket = s);
        console.log("this.port", me.port);
        server.listen(me.port, "127.0.0.1", done);
        //done();
    }
    public static afterEach(done: () => void) {
        // TestUtils.port++;
        if (socket) {
            socket.removeAllListeners();
            socket.end();
            socket.destroy();
        }
        if (server) {
            server.removeAllListeners();
            server.close(done);
        } else {
            done();
        }
    }
    public static mockSocket(mockData: any, validate: (incommingData: any) => void) {
        data = mockData;
        validateFunc = validate;
        // console.log("mockdata", socket);
        // console.log("mocking socket resposne data");
        // socket.on("data", (incomming) => {
        //     console.log("aaaaaaa");
        //     validate(incomming);
        //     console.log("data recieved on the light", incomming.toString());
        //     socket.write(JSON.stringify(mockData) + "\r\n");
        // });
    }
}