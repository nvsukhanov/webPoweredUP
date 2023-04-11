import { APP_INITIALIZER, EnvironmentProviders, isDevMode, makeEnvironmentProviders } from '@angular/core';
import { IState } from './i-state';
import {
    BLUETOOTH_AVAILABILITY_REDUCERS,
    CONFIGURE_CONTROLLER_REDUCER,
    HUB_ATTACHED_IOS_REDUCERS,
    HUB_IO_DATA_REDUCERS,
    HUB_IO_OUTPUT_MODES_REDUCER,
    HUB_PORT_MODE_INFO_REDUCERS,
    HUBS_REDUCERS
} from './reducers';
import { provideEffects } from '@ngrx/effects';
import { ConfigureControllerEffects, HubAttachedIOsEffects, HubIoDataEffects, HubIOOutputModesEffects, HubPortModeInfoEffects, HubsEffects, } from './effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { bluetoothAvailabilityCheckFactory } from './bluetooth-availability-check-factory';
import { NAVIGATOR } from '../types';
import { provideStore, Store } from '@ngrx/store';
import { HubStorageService } from './hub-storage.service';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';

export function provideApplicationStore(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideStore<IState>({
            controller: CONFIGURE_CONTROLLER_REDUCER,
            hubs: HUBS_REDUCERS,
            hubAttachedIOs: HUB_ATTACHED_IOS_REDUCERS,
            hubIOOutputModes: HUB_IO_OUTPUT_MODES_REDUCER,
            hubIOdata: HUB_IO_DATA_REDUCERS,
            hubPortModeInfo: HUB_PORT_MODE_INFO_REDUCERS,
            bluetoothAvailability: BLUETOOTH_AVAILABILITY_REDUCERS,
            router: routerReducer
        }),
        provideEffects(
            ConfigureControllerEffects,
            HubAttachedIOsEffects,
            HubPortModeInfoEffects,
            HubIoDataEffects,
            HubIOOutputModesEffects,
            HubsEffects,
        ),
        provideStoreDevtools({
            maxAge: 25,
            logOnly: !isDevMode(),
            autoPause: true,
            trace: false,
            traceLimit: 75,
        }),
        { provide: APP_INITIALIZER, useFactory: bluetoothAvailabilityCheckFactory, deps: [ NAVIGATOR, Store ], multi: true },
        HubStorageService,
        provideRouterStore()
    ]);
}
