import { EntityState } from '@ngrx/entity';
import { ControlSchemeBindingType, ExtractArrayType, ExtractEntitiesType, Override } from '@app/shared-misc';

import { ControlSchemeInput } from '../../models';
import { AppStoreVersion } from '../../app-store-version';
import { V26Store } from '../v26-v27/v26-store';
import { OldInputAction } from '../old-input-actions';

export type V26ControlSchemesEntitiesState = ExtractEntitiesType<V26Store['controlSchemes']>;
export type V25ControlSchemeInput = Omit<ControlSchemeInput, 'inputDirection'>;
export type V26Bindings = ExtractArrayType<V26ControlSchemesEntitiesState['bindings']>;
export type V26SetSpeedBinding = V26Bindings & { bindingType: ControlSchemeBindingType.SetSpeed };
export type V26ServoBinding = V26Bindings & { bindingType: ControlSchemeBindingType.Servo };
export type V26StepperBinding = V26Bindings & { bindingType: ControlSchemeBindingType.Stepper };
export type V26TrainControlBinding = V26Bindings & { bindingType: ControlSchemeBindingType.TrainControl };
export type V26GearboxControlBinding = V26Bindings & { bindingType: ControlSchemeBindingType.GearboxControl };
export type V26SetAngleBinding = V26Bindings & { bindingType: ControlSchemeBindingType.SetAngle };
export type V25SetSpeedBinding = Override<V26SetSpeedBinding, {
    inputs: {
        [OldInputAction.Accelerate]: V25ControlSchemeInput; // old ControlSchemeInputAction.Accelerate
        [OldInputAction.Brake]?: V25ControlSchemeInput; // old ControlSchemeInputAction.Brake
    };
}>;
export type V25ServoBinding = Override<V26ServoBinding, {
    inputs: {
        [OldInputAction.Servo]: V25ControlSchemeInput;
    };
}>;
export type V25StepperBinding = Override<V26StepperBinding, {
    inputs: {
        [OldInputAction.Step]: V25ControlSchemeInput;
    };
}>;
export type V25TrainControlBinding = Override<V26TrainControlBinding, {
    inputs: {
        [OldInputAction.NextLevel]: V25ControlSchemeInput;
        [OldInputAction.PrevLevel]?: V25ControlSchemeInput;
        [OldInputAction.Reset]?: V25ControlSchemeInput;
    };
}>;
export type V25GearboxControlBinding = Override<V26GearboxControlBinding, {
    inputs: {
        [OldInputAction.NextLevel]: V25ControlSchemeInput;
        [OldInputAction.PrevLevel]?: V25ControlSchemeInput;
        [OldInputAction.Reset]?: V25ControlSchemeInput;
    };
}>;
export type V25SetAngleBinding = Override<V26SetAngleBinding, {
    inputs: {
        [OldInputAction.SetAngle]: V25ControlSchemeInput;
    };
}>;
export type V25Bindings = V25SetSpeedBinding | V25ServoBinding | V25StepperBinding | V25TrainControlBinding | V25GearboxControlBinding | V25SetAngleBinding;
export type V25ControlSchemesEntitiesState = Omit<V26ControlSchemesEntitiesState, 'bindings'> & { bindings: V25Bindings[] };

export type V25Store = Override<V26Store, {
    controlSchemes: Omit<V26Store['controlSchemes'], 'entities'> & EntityState<V25ControlSchemesEntitiesState>;
    storeVersion: AppStoreVersion.v25;
}>;

