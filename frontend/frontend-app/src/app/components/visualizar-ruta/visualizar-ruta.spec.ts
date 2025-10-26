import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarRuta } from './visualizar-ruta';

describe('VisualizarRuta', () => {
  let component: VisualizarRuta;
  let fixture: ComponentFixture<VisualizarRuta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizarRuta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizarRuta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
