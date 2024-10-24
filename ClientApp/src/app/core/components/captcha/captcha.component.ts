import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { Subject } from 'rxjs';

declare global {
  interface Window {
    smartCaptchaInit: () => void;
    smartCaptcha: any;
  }
}

@Component({
  selector: 'app-captcha',
  standalone: true,
  templateUrl: './captcha.component.html',
  styleUrls: ['./captcha.component.scss'],
})
export class CaptchaComponent implements OnInit {
  @Output() captcha = new EventEmitter<string>();
  @Input() relodCaptchaTrigger: Subject<void> = new Subject<void>();

  private sitekey = 'ysc1_kIiEgRuuDp2XAd188GyZFgNbzg2UV5xxcQHoRtlA59c40785';

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    const script = this.renderer.createElement('script');
    script.src =
      'https://smartcaptcha.yandexcloud.net/captcha.js?render=onload&onload=smartCaptchaInit';
    script.async = true;
    script.defer = true;
    this.renderer.appendChild(document.body, script);
    window.smartCaptchaInit = this.smartCaptchaInit.bind(this);

    this.relodCaptchaTrigger.asObservable().subscribe(() => {
      this.reloadCaptcha();
    });
  }

  smartCaptchaInit(): void {
    if (window.smartCaptcha) {
      window.smartCaptcha.render('captcha-container', {
        sitekey: this.sitekey,
        callback: this.captchaCallback.bind(this),
      });
    }
  }

  captchaCallback(token: string): void {
    this.captcha.emit(token);
  }

  reloadCaptcha(): void {
    if (window.smartCaptcha) {
      window.smartCaptcha.reset();
    }
  }
}
