import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ImportsModule } from './imports';

@Component({
  selector: 'app-dialog-capcha',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './dialog-capcha.component.html',
  styleUrl: './dialog-capcha.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogCapchaComponent {
  readonly dialogRef = inject(MatDialogRef<DialogCapchaComponent>);

  handleClose(): void {
    this.dialogRef.close();
  }

  onCapchaPassed(token: string) {
    this.dialogRef.close(token);
  }
}
