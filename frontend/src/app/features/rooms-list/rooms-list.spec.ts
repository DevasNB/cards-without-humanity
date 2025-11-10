import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RoomsListComponent } from './rooms-list';

describe('RoomsList', () => {
  let component: RoomsListComponent;
  let fixture: ComponentFixture<RoomsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomsListComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
