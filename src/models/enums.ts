export enum DeviceStatus {
    ON = "on",
    OFF = "off",
}
export enum ColorMode {
    WHITE = 1,
    COLOR = 2,
    FLOW = 3,
}
/** */
export enum CommandType {
    SET_POWER = "set_power",
    TOGGLE = "toggle",
    SET_DEFAULT = "set_default",
    START_COLOR_FLOW = "start_cf",
    STOP_COLOR_FLOW = "stop_cf",
    GET_PROPS = "get_prop",
    SET_SCENE = "set_scene",
    SET_CT_ABX = "set_ct_abx",
    SET_RGB = "set_rgb",
    SET_HSV = "set_hsv",
    SET_BRIGHT = "set_bright",
    CRON_ADD = "cron_add",
    CRON_GET = "cron_get",
    CRON_DEL = "cron_del",
    SET_ADJUST = "set_adjust",
    SET_MUSIC = "set_music",
    SET_NAME = "set_name",
    ADJUST_BRIGHT = "adjust_bright",
    ADJUST_CT = "adjust_ct",
    ADJUST_COLOR = "adjust_color",
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
/**
 * The supported properties
 */
export enum DevicePropery {
    POWER = "power",
    BRIGHT = "bright",
    CT = "ct",
    RGB = "rgb",
    HUE = "hue",
    SAT = "sat",
    COLOR_MODE = "color_mode",
    FLOWING = "flowing",
    DELAYOFF = "delayoff",
    FLOW_PARAMS = "flow_params",
    MUSIC_ON = "music_on",
    NAME = "name",
    BG_POWER = "bg_power",
    BG_FLOWING = "bg_flowing",
    BG_FLOW_PARAMS = "bg_flow_params",
    BG_CT = "bg_ct",
    BG_LMODE = "bg_lmode",
    BG_BRIGHT = "bg_bright",
    BG_HUE = "bg_hue",
    BG_SAT = "bg_sat",
    BG_RGB = "bg_rgb",
    NL_BR = "nl_br",
    ACTIVE_MODE = "active_mode",
}

/**
 * Scene type
 */
export enum SceneType {
    /** change the smart LED to specified color and brightness. */
    COLOR = "color",
    HSV = "hsv",
    CT = "ct",
    CF = "cf",
    AUTO_DELAY_OFF = "auto_delay_off",
}
/**
 * Adjust type
 */
export enum AdjustType {
    INCREASE = "increase",
    DECREASE = "decrease",
    CIRCLE = "circle",
}