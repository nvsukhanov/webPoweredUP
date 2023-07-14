import { IHub, MotorUseProfile, PortCommandExecutionStatus } from '@nvsukhanov/rxpoweredup';
import { Observable } from 'rxjs';

import { TaskExecutor } from '../task-executor';
import { PortCommandTask, PortCommandTaskType } from '../../../../models';

export class SetSpeedExecutor extends TaskExecutor {
    protected handle(
        task: PortCommandTask,
        hub: IHub
    ): Observable<PortCommandExecutionStatus> | null {
        if (task.payload.taskType === PortCommandTaskType.SetSpeed) {
            return hub.motors.setSpeed(
                task.portId,
                task.payload.speed,
                {
                    power: task.payload.power,
                    useProfile: MotorUseProfile.dontUseProfiles
                }
            );
        }
        return null;
    }
}
