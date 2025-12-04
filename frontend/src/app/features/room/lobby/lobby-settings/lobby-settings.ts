import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { RoomResponse } from '../../../../services/room/room.types';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lobby-settings',
  imports: [CommonModule],
  templateUrl: './lobby-settings.html',
  styleUrl: './lobby-settings.css',
})
export class LobbySettings implements OnChanges {
  // ---------------------------
  // Inputs & Outputs
  // ---------------------------
  @Input() room!: RoomResponse;
  @Output() fieldChange = new EventEmitter<Partial<RoomResponse>>();

  // ---------------------------
  // Local Signals
  // ---------------------------
  protected editableRoom = signal<Partial<RoomResponse>>({});

  // Computed: check if current user is host
  @Input() isHost!: boolean;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['room'] && this.room) {
      // Initialize local editable fields
      this.editableRoom.set({
        name: this.room.name,
        isPublic: this.room.isPublic,
        winningRounds: this.room.winningRounds,
        maxPlayers: this.room.maxPlayers,
        // add other editable fields here
      });
    }
  }

  // ---------------------------
  // Methods
  // ---------------------------

  updateField<K extends keyof RoomResponse>(key: K, value: RoomResponse[K]) {
    if (!this.isHost) return;

    // Update local signal
    this.editableRoom.update((r) => ({ ...r, [key]: value }));

    // Emit partial update to parent
    this.fieldChange.emit({ [key]: value });
  }

  togglePrivacy() {
    if (!this.isHost) return;

    const newPrivacy = !this.editableRoom().isPublic;
    this.updateField('isPublic', newPrivacy);
  }

  /**
   * Copies the current room's invite link to the user's clipboard.
   * Shows an alert with a success message after copying the link.
   * @returns {void}
   */
  protected copyInviteLink(): void {
    navigator.clipboard.writeText(globalThis.location.href);
    alert('Link da sala copiado!');
  }
}
