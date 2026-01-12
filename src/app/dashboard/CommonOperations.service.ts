import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonOperations {

  private triggerActionSource = new Subject<string>();
  private triggerSourceForEditSource = new BehaviorSubject<any>(null);
  private triggerForSettingDefaultViewSource = new Subject<void>();
  triggerAction$ = this.triggerActionSource.asObservable();
  triggerForSettingDefaultViewSource$ = this.triggerForSettingDefaultViewSource.asObservable();
  triggerActionSourceForEdit$ = this.triggerSourceForEditSource.asObservable();

  triggerAction(data: string) {
    this.triggerActionSource.next(data);
  }

  triggerActionForEdit(data: any) {
    this.triggerSourceForEditSource.next(data);
  }

  triggerForSettingDefaultView() {
    this.triggerForSettingDefaultViewSource.next();
  }

  clearEditAction() {
    this.triggerSourceForEditSource.next(null);
  }

}