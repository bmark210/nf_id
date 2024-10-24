import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";

// @ts-ignore
@Component({
  selector: 'app-cookie-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-popup.component.html',
  styleUrl: './cookie-popup.component.scss'
})
export class CookiePopupComponent implements OnInit{
  showBanner: boolean = true;

  ngOnInit(): void {
    const consent = localStorage.getItem('cookieConsent');
    if (consent) {
      this.showBanner = true;
    }
  }

  acceptCookies(): void {
    localStorage.setItem('cookieConsent', 'true');
    this.showBanner = false;
  }
}

