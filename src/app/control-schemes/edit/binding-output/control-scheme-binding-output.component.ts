import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatSelectModule } from '@angular/material/select';
import { LetDirective, PushPipe } from '@ngrx/component';
import { NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, Observable, Subscription, combineLatest, map, of, shareReplay, startWith, switchMap } from 'rxjs';
import { IOType, MotorServoEndState } from '@nvsukhanov/rxpoweredup';
import { TranslocoModule } from '@ngneat/transloco';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { IoOperationTypeToL10nKeyPipe, IoTypeToL10nKeyPipe } from '@app/shared';
import { ControlSchemeBindingInputForm } from '../binding-input';
import { RenderEditOutputConfigurationDirective } from '../edit-output-configuration';
import { BindingForm } from '../types';
import { AttachedIO, HUBS_SELECTORS, HUB_ATTACHED_IO_SELECTORS, HUB_STATS_SELECTORS, HubConfiguration, HubIoOperationMode } from '../../../store';

export type LinearOutputConfigurationForm = FormGroup<{
    maxSpeed: FormControl<number>,
    isToggle: FormControl<boolean>,
    invert: FormControl<boolean>,
    power: FormControl<number>
}>;

export type ServoOutputConfigurationForm = FormGroup<{
    range: FormControl<number>,
    aposCenter: FormControl<number>,
    speed: FormControl<number>,
    power: FormControl<number>,
    invert: FormControl<boolean>,
}>;

export type SetAngleOutputConfigurationForm = FormGroup<{
    angle: FormControl<number>;
    speed: FormControl<number>;
    power: FormControl<number>;
    endState: FormControl<MotorServoEndState>;
}>;

export type ControlSchemeBindingOutputForm = FormGroup<{
    hubId: FormControl<string>,
    portId: FormControl<number>,
    operationMode: FormControl<HubIoOperationMode>,
    linearConfig: LinearOutputConfigurationForm,
    servoConfig: ServoOutputConfigurationForm,
    setAngleConfig: SetAngleOutputConfigurationForm
}>;

@Component({
    standalone: true,
    selector: 'app-control-scheme-binding-output',
    templateUrl: './control-scheme-binding-output.component.html',
    styleUrls: [ './control-scheme-binding-output.component.scss' ],
    imports: [
        MatSelectModule,
        LetDirective,
        PushPipe,
        NgForOf,
        ReactiveFormsModule,
        NgIf,
        TranslocoModule,
        IoTypeToL10nKeyPipe,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        IoOperationTypeToL10nKeyPipe,
        MatListModule,
        RenderEditOutputConfigurationDirective,
        MatIconModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlSchemeBindingOutputComponent {
    public readonly hubsList$ = this.store.select(HUBS_SELECTORS.selectHubsWithConnectionState);

    private _outputFormControl?: ControlSchemeBindingOutputForm;

    private _inputFormControl?: ControlSchemeBindingInputForm;

    private _availableIOs$: Observable<AttachedIO[]> = of([]);

    private _ioType$: Observable<IOType | null> = of(null);

    private _availableIOOperationModes$: Observable<HubIoOperationMode[]> = of([]);

    private _selectedHubConfiguration$: Observable<HubConfiguration | undefined> = EMPTY;

    private _selectedHubConnectionState$: Observable<boolean> = EMPTY;

    private selectedPortChangeTrackingSubscription?: Subscription;

    constructor(
        private readonly store: Store
    ) {
    }

    @Input()
    public set formGroup(formGroup: BindingForm) {
        this.selectedPortChangeTrackingSubscription?.unsubscribe();
        const inputGroup = formGroup.controls.input;
        const outputGroup = formGroup.controls.output;
        this._outputFormControl = outputGroup;

        this._ioType$ = combineLatest([
            outputGroup.controls.hubId.valueChanges.pipe(startWith(outputGroup.controls.hubId.value)),
            outputGroup.controls.portId.valueChanges.pipe(startWith(outputGroup.controls.portId.value)),
        ]).pipe(
            switchMap(([ hubId, portId ]) => {
                if (hubId === null || portId === null) {
                    return of(null);
                }
                return this.store.select(HUB_ATTACHED_IO_SELECTORS.selectIOAtPort({ hubId, portId }));
            }),
            map((io) => io?.ioType ?? null)
        );

        this._availableIOs$ = combineLatest([
            outputGroup.controls.hubId.valueChanges.pipe(startWith(outputGroup.controls.hubId.value)),
            inputGroup.controls.inputType.valueChanges.pipe(startWith(inputGroup.controls.inputType.value))
        ]).pipe(
            switchMap(([ hubId, inputType ]) => {
                if (hubId === null) {
                    return of([]);
                }
                return this.store.select(HUB_ATTACHED_IO_SELECTORS.selectHubIOsControllableByInputType(hubId, inputType));
            }),
            map((ios) => ios.map((io) => io.ioConfig))
        );

        this._availableIOOperationModes$ = combineLatest([
            outputGroup.controls.hubId.valueChanges.pipe(startWith(outputGroup.controls.hubId.value)),
            outputGroup.controls.portId.valueChanges.pipe(startWith(outputGroup.controls.portId.value)),
            inputGroup.controls.inputType.valueChanges.pipe(startWith(inputGroup.controls.inputType.value))
        ]).pipe(
            switchMap(([ hubId, portId, inputType ]) => {
                if (hubId === null || portId === null) {
                    return of([]);
                }
                return this.store.select(HUB_ATTACHED_IO_SELECTORS.selectHubIOOperationModes(hubId, portId, inputType));
            }),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        this._selectedHubConfiguration$ = outputGroup.controls.hubId.valueChanges.pipe(
            startWith(outputGroup.controls.hubId.value),
            switchMap((hubId) => this.store.select(HUBS_SELECTORS.selectHub(hubId))),
        );

        this._selectedHubConnectionState$ = outputGroup.controls.hubId.valueChanges.pipe(
            startWith(outputGroup.controls.hubId.value),
            switchMap((hubId) => this.store.select(HUB_STATS_SELECTORS.selectIsHubConnected(hubId))),
        );

        this._inputFormControl = inputGroup;
    }

    public get selectedHubConfiguration$(): Observable<HubConfiguration | undefined> {
        return this._selectedHubConfiguration$;
    }

    public get selectedHubConnectionState$(): Observable<boolean> {
        return this._selectedHubConnectionState$;
    }

    public get inputFormControl(): ControlSchemeBindingInputForm | undefined {
        return this._inputFormControl;
    }

    public get outputFormControl(): ControlSchemeBindingOutputForm | undefined {
        return this._outputFormControl;
    }

    public get ioType$(): Observable<IOType | null> {
        return this._ioType$;
    }

    public get availableIOs$(): Observable<AttachedIO[]> {
        return this._availableIOs$;
    }

    public get availableIOOperationModes$(): Observable<HubIoOperationMode[]> {
        return this._availableIOOperationModes$;
    }
}
