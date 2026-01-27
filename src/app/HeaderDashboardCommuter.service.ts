import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderDashboardCommuter {

  private fetchedDataSource = new BehaviorSubject<any>(null);
  fetchedData$ = this.fetchedDataSource.asObservable();

  triggerAction(data: any) {
    this.fetchedDataSource.next(data);
  }

  clearTrigger() {
    this.fetchedDataSource.next(null);
  }

}