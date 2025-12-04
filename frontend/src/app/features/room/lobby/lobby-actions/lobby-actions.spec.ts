import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbyActions } from './lobby-actions';

describe('LobbyActions', () => {
  let component: LobbyActions;
  let fixture: ComponentFixture<LobbyActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LobbyActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LobbyActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
