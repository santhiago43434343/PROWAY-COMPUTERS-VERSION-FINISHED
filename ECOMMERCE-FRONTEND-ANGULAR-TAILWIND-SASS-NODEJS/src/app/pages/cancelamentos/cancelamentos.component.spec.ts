import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelamentosComponent } from './cancelamentos.component';

describe('CancelamentosComponent', () => {
  let component: CancelamentosComponent;
  let fixture: ComponentFixture<CancelamentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelamentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
