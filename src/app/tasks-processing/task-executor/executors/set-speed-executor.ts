import { TaskExecutor } from '../task-executor';
import { Hub, MotorProfile, PortOperationCompletionInformation, PortOperationStartupInformation } from '../../../lego-hub';
import { PortCommandTask, PortCommandTaskType } from '../../../common';

export class SetSpeedExecutor extends TaskExecutor {
    protected handle(
        task: PortCommandTask,
        hub: Hub
    ): Promise<void> | null {
        if (task.taskType === PortCommandTaskType.SetSpeed) {
            return hub.motor.setSpeed(
                task.portId,
                task.speed,
                task.power,
                MotorProfile.dontUseProfiles,
                PortOperationStartupInformation.executeImmediately,
                PortOperationCompletionInformation.noAction
            );
        }
        return null;
    }
}
