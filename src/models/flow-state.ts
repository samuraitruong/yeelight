/**
 * Each visible state changing is defined to be a flow tuple that contains 4 elements:
 * [duration, mode, value, brightness].
 * A flow expression is a series of flow tuples.  So for above request example,
 * it means: change CT to 2700K & maximum brightness gradually in 1000ms,
 * then change color to red & 10% brightness gradually in 500ms, then stay at this state for 5 seconds,
 * then change CT to 5000K & minimum brightness gradually in 500ms. After 4 changes reached, stopped the
 * flow and power off the smart LED.
 */
export class FlowState {
    /**
     * @constructor
     * @param duration : Gradual change time or sleep time, in milliseconds, minimum value 50
     * @param mode : 1 – color, 2 – color temperature, 7 – sleep.
     * @param value :  RGB value when mode is 1, CT value when mode is 2, Ignored when mode is 7.
     * @param brightness  Brightness value, -1 or 1 ~ 100. Ignored when mode is 7. When this value is -1,
     * brightness in this tuple is ignored (only color or CT change takes effect).
     */
    constructor(public duration: number, public mode: number, public value: number, public brightness: number) {

    }
    /**
     * return the array of [duration, mode, value, brightness]
     */
    public getState(): any[] {
        return [this.duration, this.mode, this.value, this.brightness];
    }

}