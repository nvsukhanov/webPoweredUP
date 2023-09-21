import { Dictionary } from '@ngrx/entity';
import { ControlSchemeBindingType } from '@app/shared';

import { ControlSchemeBinding, ControllerInputModel, PortCommandTask, PortCommandTaskPayload } from '../../../../models';

export interface ITaskPayloadFactory<TBindingType extends ControlSchemeBindingType> {
    buildPayload(
        binding: ControlSchemeBinding & { bindingType: TBindingType },
        inputsState: Dictionary<ControllerInputModel>,
        motorEncoderOffset: number,
        previousTaskPayload: PortCommandTask | null
    ): { payload: PortCommandTaskPayload & { bindingType: TBindingType }; inputTimestamp: number } | null;

    buildCleanupPayload(
        previousTask: PortCommandTask
    ): PortCommandTaskPayload | null;
}
