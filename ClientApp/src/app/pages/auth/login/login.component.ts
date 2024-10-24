import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import {
  BehaviorSubject,
  finalize,
  interval,
  map,
  Observable,
  shareReplay,
  Subject,
  Subscription,
  takeUntil,
  takeWhile,
} from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatDialog } from '@angular/material/dialog';
import { DialogCapchaComponent } from './components/dialog-capcha/dialog-capcha/dialog-capcha.component';
import { ImportsModule } from './imports';

interface ITimeComponents {
  hoursLeft: number;
  secondsLeft: number;
  minutesLeft: number;
}

@UntilDestroy()
@Component({
  selector: 'app-new-login',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly dialog = inject(MatDialog);

  phoneForm: FormGroup = new FormGroup({});
  codeForm: FormGroup = new FormGroup({});
  isLoading = false;
  isCodeSent = false;
  capchaToken: string | null = null;
  phoneErrorMessage: string | null = null;
  codeErrorMessage: string | null = null;
  relodCaptchaTrigger: Subject<void> = new Subject<void>();

  private timerCount: number = 0;
  private timeLeft$: Observable<any> = new Observable();
  private $stopTimer: Subject<void> = new Subject<void>();
  private timerSubscription: Subscription = new Subscription();
  $timer: BehaviorSubject<any> = new BehaviorSubject({
    hoursLeft: 0,
    minutesLeft: 0,
    secondsLeft: 0
  });

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit() {
    this.initForms();
  }

  login(): void {
    this.authService.login().subscribe((x) => {
      console.log(x, 'login');
    });
  }

  startTimer(value: number) {
    this.resetTimerSubscription();
    this.timerCount = value;
    this.timeLeft$ = this.createTimerObservable();
    this.timerSubscription = this.timeLeft$
      .pipe(untilDestroyed(this))
      .subscribe((x) => {
        this.$timer.next(x);
      });
  }

  stopTimer() {
    this.$stopTimer.next();
    this.timeLeft$ = new Observable();
    this.$timer.next({ hoursLeft: 0, minutesLeft: 0, secondsLeft: 0 });
    this.timerSubscription.unsubscribe();
  }

  private createTimerObservable(): Observable<ITimeComponents> {
    return interval(1000).pipe(
      map(() => {
        this.timerCount--;
        return this.calcDateDiff(this.timerCount);
      }),
      takeWhile(() => this.timerCount >= 0),
      takeUntil(this.$stopTimer),
      untilDestroyed(this),
      shareReplay(1)
    );
  }

  private resetTimerSubscription() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  initForms() {
    this.phoneForm = this.fb.group({
      phoneNumber: [
        null,
        [Validators.required, Validators.pattern(/^\d{8,}$/)],
      ],
      capcha: [null, [Validators.required]],
    });

    this.codeForm = this.fb.group({
      code: [null, [Validators.required, Validators.maxLength(4)]],
    });
  }

  onPhoneSubmit() {
    this.isLoading = true;
    const rawPhoneNumber = this.phoneForm.controls['phoneNumber']?.value;
    const phoneNumber = this.cleanPhoneNumber(rawPhoneNumber);
    const capchaToken = this.phoneForm.controls['capcha']?.value;
    const requestBody = { token: capchaToken, login: phoneNumber };

    this.authService
      .getVerificationCode(requestBody)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.startTimerIfRequired(response);
          this.isCodeSent = true;
        },
        error: (error) => {
          this.startTimerIfRequired(error);
          this.resetPhoneForm();
          if (error) {
            this.phoneErrorMessage = error['error']['errors']['common'][0];
          } else {
            this.phoneErrorMessage =
              'Ошибка при отправке кода. Попробуйте ещё раз.';
          }
        },
      });
  }

  onCodeSubmit() {
    if (this.codeForm.invalid) {
      return;
    }
    this.isLoading = true;
    const rawPhoneNumber = this.phoneForm.get('phoneNumber')?.value;
    const phoneNumber = this.cleanPhoneNumber(rawPhoneNumber);
    const code = this.codeForm.get('code')?.value;

    this.authService
      .sendVerificationCode(phoneNumber, code)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {
          this.codeErrorMessage = null;
          this.login();
        },
        error: (error) => {
          this.codeErrorMessage = error['error']['message'];
        },
      });
  }

  onCapchaPassed(token: string) {
    this.phoneForm.controls['capcha'].setValue(token);
  }

  onSecondCapchaPassed(token: string) {
    this.onCapchaPassed(token);
    this.onPhoneSubmit();
  }

  goBack() {
    this.stopTimer();
    this.resetPhoneForm();
    this.codeErrorMessage = null;
    this.isCodeSent = false;
    this.codeForm.reset();
  }

  resetPhoneForm() {
    this.phoneForm.reset();
    this.relodCaptchaTrigger.next();
  }

  openCapchaDialog(): void {
    const dialogRef = this.dialog.open(DialogCapchaComponent, {
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((token) => {
        if (token) {
          this.onSecondCapchaPassed(token);
          this.codeErrorMessage = null;
        }
      });
  }

  cleanPhoneNumber(phoneNumber: string): string {
    const digits = phoneNumber.replace(/\D/g, '');
    return digits.length === 10 ? `+7${digits}` : `+7${digits.slice(-10)}`;
  }

  calcDateDiff(seconds: number): {
    hoursLeft: number;
    minutesLeft: number;
    secondsLeft: number;
  } {
    const secondsInAMinute = 60;
    const secondsInHour = 60 * 60;

    const hoursLeft = Math.floor(seconds / secondsInHour);
    const minutesLeft = Math.floor((seconds % secondsInHour) / secondsInAMinute);
    const secondsLeft = Math.floor(seconds % secondsInAMinute);

    return { hoursLeft, minutesLeft, secondsLeft };
  }

  startTimerIfRequired(req: any) {
    let timerValue = parseInt(req.headers.get('Retry-After'));
    if (timerValue) {
      this.startTimer(timerValue);
    } else {
      this.stopTimer();
    }
  }
}
