import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookiePanelComponent } from './cookie-panel.component';

describe('CookiePanel', () => {
  let component: CookiePanelComponent;
  let fixture: ComponentFixture<CookiePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookiePanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CookiePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
