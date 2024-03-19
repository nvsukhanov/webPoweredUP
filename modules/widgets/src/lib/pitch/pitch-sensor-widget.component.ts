import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoPipe } from '@ngneat/transloco';
import { MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { TiltGaugeComponent, TiltGaugeIconDirective, WidgetComponent } from '@app/shared-ui';

@Component({
    standalone: true,
    selector: 'lib-pitch-sensor-widget',
    templateUrl: './pitch-sensor-widget.component.html',
    styleUrls: [ '../common/common-tilt-widgets-styles.scss' ],
    imports: [
        WidgetComponent,
        TiltGaugeIconDirective,
        MatButtonModule,
        TranslocoPipe,
        TiltGaugeComponent,
        MatMenuItem,
        MatIcon,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PitchSensorWidgetComponent {
    @Input() public pitch: number | null = null;

    @Input() public title = '';

    @Input() public canBeDeleted = false;

    @Input() public canBeEdited = false;

    @Output() public readonly edit = new EventEmitter<void>();

    @Output() public readonly delete = new EventEmitter<void>();

    @Output() public readonly compensate = new EventEmitter<number>();

    @Output() public readonly resetCompensation = new EventEmitter<void>();

    private isCompensating = false;

    public toggleCompensation(): void {
        if (this.isCompensating) {
            this.resetCompensation.emit();
            this.isCompensating = false;
        } else if (this.pitch !== null) {
            this.compensate.emit(this.pitch);
            this.isCompensating = true;
        }
    }

    public onEdit(): void {
        this.edit.emit();
    }

    public onDelete(): void {
        this.delete.emit();
    }
}
