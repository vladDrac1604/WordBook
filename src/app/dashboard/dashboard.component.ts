import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared-service';
import { HttpClient } from '@angular/common/http';
import { NavigationExtras, Router } from '@angular/router';
import { HeaderDashboardCommuter } from '../HeaderDashboardCommuter.service';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AddTheWordDialogComponent } from './add-the-word-dialog/add-the-word-dialog.component';
declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  destroy$ = new Subject<void>();
  allWordsFromDB: any[] = [];
  favouriteWords: any[] = [];
  mostSearchedWords: any[] = [];
  inputToWordsList: any[] = [];
  currentPage: number = 0;
  paginatorValues: any = null;
  toastMessage: string | null = null;
  currentAction: string = "all";
  public deletedWord: string | null = null;
  public updatedWord: string | null = null;
  changeTabToDefault: boolean = false;
  private subs!: Subscription;

  constructor(private sharedService: SharedService,
    private http: HttpClient,
    private router: Router,
    private headerDashBoardCommuter: HeaderDashboardCommuter,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.subs = this.headerDashBoardCommuter.fetchedData$.subscribe((data) => {
      if (data) {
        if (data.action === "editSuccess") {
          this.toastMessage = "The word has been updated successfully";
          this.showToast();
        } else {
          const ref = this.dialog.open(AddTheWordDialogComponent, {
            width: '600px',
            data: data
          });
          ref.componentInstance.wordOfTheDayAdded = this.wordOfTheDayAdded.bind(this);
        }
      }
    })

    this.http.get<any>("http://localhost:3000/wordBook/getAll").subscribe((response) => {
      if (response.status === "INFORMATION") {
        this.resetValues();
        this.sharedService.infoPopup("Information", response.message);
      } else if (response.status === "FAILURE") {
        this.resetValues();
        this.sharedService.errorPopup("Failure", response.message);
      } else {
        this.setInitialData(response);
      }
    })
  }

  setInitialData(response: any) {
    this.allWordsFromDB = response.data;
    this.favouriteWords = this.allWordsFromDB.filter((data) => (data.favourite && data.favourite === "Y"));
    this.mostSearchedWords = this.allWordsFromDB.filter((data) => (data.searchCount && data.searchCount > 0));
    if (this.mostSearchedWords.length > 1) {
      this.mostSearchedWords.sort((a, b) => b.searchCount - a.searchCount);
    }
    this.inputToWordsList = [...this.allWordsFromDB];
  }

  resetValues() {
    this.allWordsFromDB = [];
    this.favouriteWords = [];
    this.inputToWordsList = [];
  }

  refreshMostSearchedList(listOfWords: any) {
    const wordTerms = listOfWords.map((temp: any) => temp.word);
    const alreadyPresentSearchedWords = this.mostSearchedWords.map((temp: any) => temp.word);
    for (let temp of wordTerms) {
      if (!alreadyPresentSearchedWords.includes(temp)) {
        const index = listOfWords.findIndex((x: any) => x.word === temp);
        if (index != -1) this.mostSearchedWords.push(listOfWords[index]);
      } else {
        const index = this.mostSearchedWords.findIndex((x: any) => x.word === temp);
        this.mostSearchedWords[index].searchCount += 1;
      }
    }
    if (this.mostSearchedWords.length > 1) {
      this.mostSearchedWords.sort((a, b) => b.searchCount - a.searchCount);
    }
  }

  searchedWordFound(data: any) {
    if (data.length === 0 && this.allWordsFromDB.length > 0) {
      this.changeTabToDefault = true;
      this.inputToWordsList = [...this.allWordsFromDB];
    } else {
      this.refreshMostSearchedList(data);
      this.inputToWordsList = [...data];
    }
    this.currentPage = 0;
    this.paginatorValues = {
      pageNum: 0,
      pageSize: 5
    };
  }

  changeTab(term: string) {
    if (term && term != "") {
      const extras: NavigationExtras = {
        queryParams: { word: term }
      };
      this.router.navigate(['/addWord'], extras);
    }
  }

  wordDeleted(deletedWordData: any) {
    const deletedId = deletedWordData._id;
    const word = this.sharedService.capitalizeSentence(deletedWordData.word)
    this.toastMessage = `The word ${word} has been removed.`;
    this.inputToWordsList = this.inputToWordsList.filter((word) => word._id != deletedId);

    if (this.allWordsFromDB.length > 0) {
      this.allWordsFromDB = this.allWordsFromDB.filter((word) => word._id != deletedId);
    }
    if (this.favouriteWords.length > 0) {
      this.favouriteWords = this.favouriteWords.filter((word) => word._id != deletedId);
    }
    this.showToast();
  }

  favouriteChanged(data: any) {
    const updatedId = data._id;
    const word = this.sharedService.capitalizeSentence(data.word);
    this.toastMessage = data.favourite === "Y" ? `The word ${word} has been added to favourites.` : `The word ${word} has been removed from favourites.`;
    this.inputToWordsList = this.inputToWordsList.map(dataTemp => ({
      ...dataTemp,
      favourite: (dataTemp._id === updatedId) ? data.favourite : dataTemp.favourite
    }));
    this.allWordsFromDB = this.allWordsFromDB.map(dataTemp => ({
      ...dataTemp,
      favourite: (dataTemp._id === updatedId) ? data.favourite : dataTemp.favourite
    }));

    if (data.favourite === "N") {
      this.favouriteWords = this.favouriteWords.filter((word) => word._id != updatedId);
    } else {
      this.favouriteWords.push(data);
    }
    this.setDataAccordingToAction();
    this.showToast();
  }

  setDataAccordingToAction() {
    if (this.currentAction === "all") {
      this.inputToWordsList = [...this.allWordsFromDB];
    } else if (this.currentAction === "favourites") {
      this.inputToWordsList = [...this.favouriteWords]
    } else {

    }
  }

  showToast() {
    const toastEl = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastEl!);
    toast.show();
  }

  closeBottom() {
    this.deletedWord = null;
    this.toastMessage = null;
  }

  wordsDisplayChange(action: any) {
    this.currentAction = action;
    this.paginatorValues = {
      pageNum: 0,
      pageSize: 5
    };
    if (action === "all") {
      this.inputToWordsList = [...this.allWordsFromDB];
    } else if (action === "favourites") {
      this.inputToWordsList = [...this.favouriteWords];
    } else {
      if (this.mostSearchedWords.length > 0) {
        this.inputToWordsList = [...this.mostSearchedWords];
      }
    }
  }

  wordOfTheDayAdded(data: any) {
    this.allWordsFromDB.push(data);
    this.wordsDisplayChange("all");
  }

  ngOnDestroy() {
    if (this.subs) {
      this.subs.unsubscribe();
      this.headerDashBoardCommuter.clearTrigger();
    }
  }

}
