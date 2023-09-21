import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';
import { Memoize } from 'typescript-memoize';

import { IAppConfig } from '../../i-app-config';
import { ControllerType } from '../controller-type';
import { IControllerProfile } from '../i-controller-profile';
import { createControllerL10nKey, createScopedControllerL10nKeyBuilder } from '../create-controller-l10n-key';
import { GamepadAxisSettings, GamepadButtonSettings, GamepadSettings } from '../controller-settings';

export class ControllerProfileGenericGamepad implements IControllerProfile<GamepadSettings> {
    public readonly name$: Observable<string>;

    public readonly buttonStateL10nKey = createControllerL10nKey('buttonState');

    public readonly axisStateL10nKey = createControllerL10nKey('axisState');

    public readonly triggerButtonsIndices = [];

    private readonly l10nScopeKeyBuilder: (key: string) => string;

    constructor(
        public readonly uid: string,
        private readonly axesCount: number,
        private readonly buttonsCount: number,
        private readonly translocoService: TranslocoService,
        private readonly appConfig: IAppConfig
    ) {
        this.l10nScopeKeyBuilder = createScopedControllerL10nKeyBuilder('genericGamepad');
        this.name$ = this.translocoService.selectTranslate(this.l10nScopeKeyBuilder('name'));
    }

    @Memoize()
    public getAxisName$(
        inputId: string
    ): Observable<string> {
        return this.translocoService.selectTranslate(this.l10nScopeKeyBuilder('axis'), { inputId });
    }

    @Memoize()
    public getButtonName$(
        inputId: string
    ): Observable<string> {
        return this.translocoService.selectTranslate(this.l10nScopeKeyBuilder('button'), { inputId });
    }

    public getDefaultSettings(): GamepadSettings {
        const axisConfigs: { [k in string]: GamepadAxisSettings } = {};
        for (let i = 0; i < this.axesCount; i++) {
            axisConfigs[i] = {
                activeZoneStart: this.appConfig.gamepadDefaultDeadZoneStart,
                activeZoneEnd: 1,
                invert: false,
                ignoreInput: false,
                trim: 0
            };
        }
        const buttonConfigs: { [k in string]: GamepadButtonSettings } = {};
        for (let i = 0; i < this.buttonsCount; i++) {
            buttonConfigs[i] = {
                activeZoneStart: this.appConfig.gamepadDefaultDeadZoneStart,
                activeZoneEnd: 1,
                ignoreInput: false,
                trim: 0
            };
        }
        return {
            controllerType: ControllerType.Gamepad,
            axisConfigs,
            buttonConfigs
        };
    }
}
