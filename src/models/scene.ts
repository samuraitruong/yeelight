import { Color } from "./color";
import { SceneType, StartFlowAction } from "./enums";
import { FlowState } from "./flow-state";

export class Scene {
    constructor(public type: SceneType) {

    }
    public getData(): any[] {
        return null;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class ColorScene extends Scene {
    constructor(public color: Color, public bright: number) {
        super(SceneType.COLOR);
    }
    public getData() {
        return [this.type, this.color.getValue(), this.bright];
    }
}

// tslint:disable-next-line:max-classes-per-file
export class HsvScene extends Scene {
    constructor(public hue: number, public satuation: number, public brightness: number) {
        super(SceneType.HSV);
    }
    public getData() {
        return [this.type, this.hue, this.satuation, this.brightness];
    }
}
/**
 * change the smart LED to specified ct and brightness
 */
// tslint:disable-next-line:max-classes-per-file
export class CtScene extends Scene {
    /**
     * @constructor
     * @param temperature : K temperature value
     * @param brightness  max brightness level
     */
    constructor(public temperature: number, public brightness: number) {
        super(SceneType.CT);
    }
    public getData() {
        return [this.type, this.temperature, this.brightness];
    }
}

// tslint:disable-next-line:max-classes-per-file
export class CfScene extends Scene {
    /**
     * @constructor
     * @param flowAction The LED behavior after flow finish
     * @param states : The set of state changes
     * @param repeat : number of repeas. 0 is infinity
     */
    constructor(public flowAction: StartFlowAction, public states: FlowState[], public repeat: number) {
        super(SceneType.CF);
    }
    public getData() {
        const list = this.states.reduce((a, b) => [...a, ...b.getState()], []);
        return [this.type, this.repeat, this.flowAction, list.join(",")];
    }
}