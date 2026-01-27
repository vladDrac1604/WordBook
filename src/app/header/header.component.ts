import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HeaderDashboardCommuter } from '../HeaderDashboardCommuter.service';
import { SharedService } from '../shared-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private http: HttpClient,
    private headerDashboardCommuter: HeaderDashboardCommuter,
    private sharedService: SharedService) { }

  getWordOfTheDay() {
    const apiKey = this.sharedService.getWordsNikApiKey();
    const version = this.sharedService.getWordsNikVersion();
    const url = `https://api.wordnik.com/${version}/words.json/wordOfTheDay?api_key=${apiKey}`;
    this.callWordsNikApis(url).subscribe({
      next: (response) => {
        const data = { status: 'SUCCESS', value: response, action: "apiResponse" };
        this.headerDashboardCommuter.triggerAction(data);
      }, error: (error) => {
        const status = error.status ? error.status : 500;
        const message = error.error.message ? error.error.message : "Internal server error"; 
        const data = { status: 'ERROR', action: "apiResponse", value: {errorCode: status, errorMsg: message} };
        this.headerDashboardCommuter.triggerAction(data);  
      }
    })
  }

  callWordsNikApis(url: string): Observable<any> {
    return this.http.get(url);
  }

  ngOnInit(): void {
  }

}
