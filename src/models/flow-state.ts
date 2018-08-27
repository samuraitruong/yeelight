/**
 * Each visible state changing is defined to be a flow tuple that contains 4 elements: [duration, mode, value, brightness].
 * A flow expression is a series of flow tuples.  So for above request example,
 * it means: change CT to 2700K & maximum brightness gradually in 1000ms,
 * then change color to red & 10% brightness gradually in 500ms, then stay at this state for 5 seconds,
 * then change CT to 5000K & minimum brightness gradually in 500ms. After 4 changes reached, stopped the flow and power off the smart LED.  
 */
export class FlowState {
    constructor(public duration: number, public mode: number, public value: number, public brightness: number) {

    }
    public getState(): any[] {
        return [this.duration, this.mode, this.value, this.brightness];
    }

}