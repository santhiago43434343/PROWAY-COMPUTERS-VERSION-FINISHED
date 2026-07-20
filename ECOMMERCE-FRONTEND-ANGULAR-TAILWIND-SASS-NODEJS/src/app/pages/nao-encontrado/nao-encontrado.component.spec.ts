import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NaoEncontradoComponent } from '@pages/nao-encontrado/nao-encontrado.component';

describe('NaoEncontrado', () => {
  let component: NaoEncontradoComponent;
  let fixture: ComponentFixture<NaoEncontradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NaoEncontradoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NaoEncontradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
