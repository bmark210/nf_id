import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() title: string = '';
  @Input() classes: string = '';
  @Input() type: string = 'button';
  @Input() disabled: boolean = false;
  @Input() isLoading: boolean = false;
}
