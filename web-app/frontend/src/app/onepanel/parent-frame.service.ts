import { EventEmitter, Injectable } from '@angular/core';

export type KfservingMessageType = 'confirm-namespace' | 'navigation';

export interface KfservingMessage {
  type: KfservingMessageType;
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class ParentFrameService {
  private parentWindow?: Window;

  // tslint:disable-next-line:variable-name
  private _namespace?: string;
  get namespace(): string|undefined {
    return this._namespace;
  }
  get hasNamespace(): boolean {
    return this.namespace !== undefined;
  }

  public namespaceChange = new EventEmitter<string>();

  constructor() {
    window.addEventListener('message', (event) => {
      this._namespace = event.data;
      this.namespaceChange.emit(event.data);

      this.parentWindow = event.source as Window;
      if (!this.parentWindow) {
        return;
      }

      const message: KfservingMessage = {
        type: 'confirm-namespace',
        data: event.data,
      };

      this.sendMessage(message);
    }, false);
  }

  private sendMessage(message: KfservingMessage) {
    if (!this.parentWindow) {
      return;
    }

    this.parentWindow.postMessage(message, '*');
  }

  public sendModelDetailNavigation(namespace: string, modelName: string) {
    const message: KfservingMessage = {
      type: 'navigation',
      data: {
        page: 'model-detail',
        namespace,
        model: modelName
      }
    };

    this.sendMessage(message);
  }

  public sendIndexNavigation(namespace: string) {
    const message: KfservingMessage = {
      type: 'navigation',
      data: {
        page: 'index',
        namespace
      }
    };

    this.sendMessage(message);
  }
}
