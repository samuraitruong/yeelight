export enum DeviceStatus {
    ON = "on",
    OFF = "off",
}
export enum ColorMode {
    WHITE = 1,
    COLOR = 2,
    FLOW = 3,
}
export enum CommandType {
    SET_POWER = "set_power",
    TOGGLE = "toggle",
    SET_DEFAULT = "set_default",
    START_COLOR_FLOW = "start_cf",
}
/**
 * the action taken after the flow is stopped.
 */
export enum StartFlowAction {
    /** smart LED recover to the state before the color flow started. */
    LED_RECOVER = 0,
    /** 1 means smart LED stay at the state when the flow is stopped */
    LED_STAY = 1,
    /** turn off the smart LED after the flow is stopped. */
    LED_OFF = 2,
}