import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookieService } from '@services/cookie.service';

describe('CookieBanner', () => {
  let component: CookieService;
  let fixture: ComponentFixture<CookieService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookieService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CookieService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
