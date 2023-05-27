/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import {
    AttachedIO,
    AttachedIOState,
    ControlScheme,
    GamepadAxisState,
    GamepadButtonState,
    GamepadConfig,
    HubConfiguration,
    HubIoSupportedModes,
    PortModeInfo
} from './i-state';
import { IOType } from '@nvsukhanov/rxpoweredup';
import { PortCommandTask } from '../common';

export const HUB_ATTACHED_IOS_ENTITY_ADAPTER: EntityAdapter<AttachedIO> = createEntityAdapter<AttachedIO>({
    selectId: (io) => hubAttachedIosIdFn(io.hubId, io.portId),
    sortComparer: (a, b) => a.portId - b.portId
});

export function hubAttachedIosIdFn(hubId: string, portId: number) {
    return `${hubId}/${portId}`;
}

export const HUBS_ENTITY_ADAPTER: EntityAdapter<HubConfiguration> = createEntityAdapter<HubConfiguration>({
    selectId: (hub) => hub.hubId,
    sortComparer: (a, b) => a.hubId.localeCompare(b.hubId)
});

export const HUB_PORT_MODE_INFO: EntityAdapter<PortModeInfo> = createEntityAdapter<PortModeInfo>({
    selectId: (mode) => hubPortModeInfoIdFn(mode.hardwareRevision, mode.softwareRevision, mode.modeId, mode.ioType),
});

export function hubPortModeInfoIdFn(hardwareRevision: string, softwareRevision: string, modeId: number, ioType: IOType): string {
    return `${hardwareRevision}/${softwareRevision}/${modeId}/${ioType}`;
}

export const HUB_IO_SUPPORTED_MODES_ENTITY_ADAPTER: EntityAdapter<HubIoSupportedModes> = createEntityAdapter<HubIoSupportedModes>({
    selectId: (mode) => hubIOSupportedModesIdFn(mode.hardwareRevision, mode.softwareRevision, mode.ioType),
});

export function hubIOSupportedModesIdFn(hardwareRevision: string, softwareRevision: string, ioType: IOType): string {
    return `${hardwareRevision}/${softwareRevision}/${ioType}`;
}

export const GAMEPADS_ENTITY_ADAPTER: EntityAdapter<GamepadConfig> = createEntityAdapter<GamepadConfig>({
    selectId: (gamepad) => gamepad.gamepadIndex,
    sortComparer: (a, b) => a.gamepadIndex - b.gamepadIndex
});

export const GAMEPAD_AXES_STATES_ENTITY_ADAPTER: EntityAdapter<GamepadAxisState> = createEntityAdapter<GamepadAxisState>({
    selectId: (state) => gamepadAxisIdFn(state.gamepadIndex, state.axisIndex),
    sortComparer: (a, b) => a.axisIndex - b.axisIndex
});

export function gamepadAxisIdFn(gamepadIndex: number, axisIndex: number): string {
    return `${gamepadIndex}/${axisIndex}`;
}

export const GAMEPAD_BUTTONS_STATES_ENTITY_ADAPTER: EntityAdapter<GamepadButtonState> = createEntityAdapter<GamepadButtonState>({
    selectId: (state) => gamepadButtonIdFn(state.gamepadIndex, state.buttonIndex),
    sortComparer: (a, b) => a.buttonIndex - b.buttonIndex
});

export function gamepadButtonIdFn(gamepadIndex: number, buttonIndex: number): string {
    return `${gamepadIndex}/${buttonIndex}`;
}

export const CONTROL_SCHEMES_ENTITY_ADAPTER: EntityAdapter<ControlScheme> = createEntityAdapter<ControlScheme>({
    selectId: (scheme) => scheme.id,
    sortComparer: (a, b) => a.index - b.index
});

export const LAST_EXECUTED_TASKS_ENTITY_ADAPTER: EntityAdapter<PortCommandTask> = createEntityAdapter<PortCommandTask>({
    selectId: (task) => lastExecutedTaskIdFn(task.hubId, task.portId),
});

export function lastExecutedTaskIdFn(hubId: string, portId: number): string {
    return `${hubId}/${portId}`;
}

export const HUB_ATTACHED_IO_STATE_ENTITY_ADAPTER: EntityAdapter<AttachedIOState> = createEntityAdapter<AttachedIOState>({
    selectId: (io) => hubAttachedIosIdFn(io.hubId, io.portId),
});

