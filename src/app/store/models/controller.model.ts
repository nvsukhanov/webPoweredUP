import { ControllerType } from '@app/shared';

export type GamepadControllerModel = {
    id: string;
    controllerType: ControllerType.Gamepad;
    gamepadIndex: number;
    axesCount: number;
    buttonsCount: number;
    triggerButtonIndices: number[];
};

export type KeyboardControllerModel = {
    id: string;
    controllerType: ControllerType.Keyboard;
};

export type ControllerModel = GamepadControllerModel | KeyboardControllerModel;
