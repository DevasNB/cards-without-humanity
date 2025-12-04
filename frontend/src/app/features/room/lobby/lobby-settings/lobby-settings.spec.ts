import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbySettings } from './lobby-settings';

describe('LobbySettings', () => {
  let component: LobbySettings;
  let fixture: ComponentFixture<LobbySettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LobbySettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LobbySettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
