import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscaneoQrPage } from './escaneo-qr.page';

describe('EscaneoQrPage', () => {
  let component: EscaneoQrPage;
  let fixture: ComponentFixture<EscaneoQrPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EscaneoQrPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
