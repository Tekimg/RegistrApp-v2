import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotfoundpagePage } from './notfoundpage.page';

describe('NotfoundpagePage', () => {
  let component: NotfoundpagePage;
  let fixture: ComponentFixture<NotfoundpagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotfoundpagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
