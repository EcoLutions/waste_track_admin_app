import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private messageService: MessageService) {}

  success(detail: string) {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail });
  }

  error(detail: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail });
  }

  warn(detail: string) {
    this.messageService.add({ severity: 'warn', summary: 'Atención', detail });
  }
}
