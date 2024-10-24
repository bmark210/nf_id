import { NgModule } from "@angular/core";
import { ButtonComponent } from "../../../core/components/common/button.component";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { NgxMaskDirective, NgxMaskPipe } from "ngx-mask";
import { CaptchaComponent } from "../../../core/components/captcha/captcha.component";
import { CookiePopupComponent } from "../../../core/components/cookie-popup/cookie-popup.component";
import { PhoneNumberFormatPipe } from "../../../core/pipes/phoneHideFormat.pipe";

@NgModule({
  imports: [
    NgxMaskDirective,
    NgxMaskPipe,
    CookiePopupComponent,
    CommonModule,
    ReactiveFormsModule,
    CaptchaComponent,
    PhoneNumberFormatPipe,
    ButtonComponent
  ],
  exports: [
    NgxMaskDirective,
    NgxMaskPipe,
    CookiePopupComponent,
    CommonModule,
    ReactiveFormsModule,
    CaptchaComponent,
    PhoneNumberFormatPipe,
    ButtonComponent
  ],
  providers: [  ]
})
export class ImportsModule {}
