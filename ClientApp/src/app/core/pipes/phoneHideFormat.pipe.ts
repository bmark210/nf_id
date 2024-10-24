import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneNumberFormat',
  standalone: true,
})
export class PhoneNumberFormatPipe implements PipeTransform {

  // pipe for phone number format
  // in like this => 9998887766 return like this (99*) ***-77-66

  transform(value: string): string {
    const digits = value ? value.toString().trim() : value;
    if (digits.length !== 10) {
      return value
    }

    const firstTwo = digits.slice(0, 2);
    const lastFour = digits.slice(-4);

    return ` (${firstTwo}*) ***-${lastFour.slice(0, 2)}-${lastFour.slice(2)}`;
  }
}
