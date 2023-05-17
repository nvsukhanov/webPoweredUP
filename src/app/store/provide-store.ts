import { APP_INITIALIZER, EnvironmentProviders, isDevMode, makeEnvironmentProviders } from '@angular/core';
import { IState } from './i-state';
import {
    BLUETOOTH_AVAILABILITY_REDUCERS,
    CONTROL_SCHEME_CONFIGURATION_STATE_REDUCERS,
    CONTROL_SCHEME_REDUCERS,
    CONTROL_SCHEME_RUNNING_STATE_REDUCERS,
    GAMEPAD_AXES_STATE_REDUCERS,
    GAMEPAD_BUTTONS_STATE_REDUCERS,
    GAMEPAD_REDUCERS,
    HUB_ATTACHED_IOS_REDUCERS,
    HUB_EDIT_FORM_ACTIVE_SAVES_REDUCERS,
    HUB_IO_OUTPUT_MODES_REDUCER,
    HUB_PORT_MODE_INFO_REDUCERS,
    HUBS_REDUCERS,
    LAST_EXECUTED_TASKS_REDUCER
} from './reducers';
import { provideEffects } from '@ngrx/effects';
import {
    ControlSchemeEffects,
    GamepadEffects,
    HubAttachedIOsEffects,
    HubIOSupportedModesEffects,
    HubPortModeInfoEffects,
    HubsEffects,
    PortOutputCommandEffects,
} from './effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { bluetoothAvailabilityCheckFactory } from './bluetooth-availability-check-factory';
import { NAVIGATOR } from '../common';
import { ActionReducer, ActionReducerMap, MetaReducer, provideStore, Store } from '@ngrx/store';
import { HubStorageService } from './hub-storage.service';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { GAMEPAD_ACTIONS } from './actions';
import { localStorageSync } from 'ngrx-store-localstorage';

const REDUCERS: ActionReducerMap<IState> = {
    controlSchemes: CONTROL_SCHEME_REDUCERS,
    controlSchemeConfigurationState: CONTROL_SCHEME_CONFIGURATION_STATE_REDUCERS,
    controlSchemeRunningState: CONTROL_SCHEME_RUNNING_STATE_REDUCERS,
    gamepads: GAMEPAD_REDUCERS,
    gamepadAxesState: GAMEPAD_AXES_STATE_REDUCERS,
    gamepadButtonsState: GAMEPAD_BUTTONS_STATE_REDUCERS,
    hubs: HUBS_REDUCERS,
    hubAttachedIOs: HUB_ATTACHED_IOS_REDUCERS,
    hubIOSupportedModes: HUB_IO_OUTPUT_MODES_REDUCER,
    hubPortModeInfo: HUB_PORT_MODE_INFO_REDUCERS,
    lastExecutedTasks: LAST_EXECUTED_TASKS_REDUCER,
    hubEditFormActiveSaves: HUB_EDIT_FORM_ACTIVE_SAVES_REDUCERS,
    bluetoothAvailability: BLUETOOTH_AVAILABILITY_REDUCERS,
    router: routerReducer
};

export function localStorageSyncReducer(reducer: ActionReducer<IState>): ActionReducer<IState> {
    return localStorageSync({
        keys: [ 'controlSchemes', 'hubIOSupportedModes', 'hubPortModeInfo' ] satisfies Array<keyof IState>,
        rehydrate: true
    })(reducer);
}

const metaReducers: Array<MetaReducer<IState>> = [ localStorageSyncReducer ];

export function provideApplicationStore(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideStore<IState>(REDUCERS, { metaReducers }),
        provideEffects(
            GamepadEffects,
            HubAttachedIOsEffects,
            HubPortModeInfoEffects,
            HubIOSupportedModesEffects,
            HubsEffects,
            ControlSchemeEffects,
            PortOutputCommandEffects
        ),
        provideStoreDevtools({
            maxAge: 100,
            logOnly: !isDevMode(),
            autoPause: true,
            trace: false,
            traceLimit: 75,
            actionsBlocklist: [
                GAMEPAD_ACTIONS.updateGamepadsValues.type
            ]
        }),
        { provide: APP_INITIALIZER, useFactory: bluetoothAvailabilityCheckFactory, deps: [ NAVIGATOR, Store ], multi: true },
        HubStorageService,
        provideRouterStore()
    ]);
}
