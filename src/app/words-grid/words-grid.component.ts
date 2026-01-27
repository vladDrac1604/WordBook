import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared-service';
import { Observable, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { HeaderDashboardCommuter } from '../HeaderDashboardCommuter.service';
import { AddTheWordDialogComponent } from '../dashboard/add-the-word-dialog/add-the-word-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonOperations } from '../dashboard/CommonOperations.service';
declare var bootstrap: any;

@Component({
  selector: 'app-words-grid',
  templateUrl: './words-grid.component.html',
  styleUrls: ['./words-grid.component.css']
})
export class WordsGridComponent implements OnInit {

  public randomWords: any[] = [];
  public flipTracker: boolean[] = Array(9).fill(false);
  public definitions: any[] = Array(9).fill(null);
  public definitionsWithPartOfSpeech: any[] = Array(9).fill(null);
  public apiKey: any = null;
  public apiVersion: any = null;
  private subs!: Subscription;
  toastMessage: string | null = null;
  private posOptions: any[] = ["noun", "verb", "adverb", "adjective", "pronoun"];

  toggleFlip(index: number, word: string) {
    this.flipTracker[index] = !this.flipTracker[index];
    if (!this.definitions[index] && this.flipTracker[index]) {
      this.callWordsNikApiAndAddTheDefinitionsToList(index, word);
    }
  }

  callWordsNikApiAndAddTheDefinitionsToList(index: number, word: string) {
    const url = `https://api.wordnik.com/${this.apiVersion}/word.json/${word}/definitions?limit=5&includeRelated=false&useCanonical=false&includeTags=false&api_key=${this.apiKey}`;
    this.callWordsNikApis(url).subscribe({
      next: (response) => {
        if (response.length > 0) {
          let definitionList: any = [];
          let definitionsWithPartsOfSpeechList: any = [];
          for (let data of response) {
            data = this.setCompliantPOS(data);
            definitionsWithPartsOfSpeechList.push(data);
            if (data.text && !definitionList.includes(data.text.trim())) definitionList.push(data.text.trim());
          }
          this.definitions[index] = definitionList;
          this.definitionsWithPartOfSpeech[index] = definitionsWithPartsOfSpeechList;
        }
      }, error: (error) => {
        this.flipTracker[index] = false;
        const errorCode = error.status ? error.status : 500;
        const errorMessage = error.error.message ? error.error.message : "Internal server error";
        this.toastMessage = `${errorCode} - ${errorMessage}`;
        this.showToast();
      }
    });
  }

  setCompliantPOS(data: any) {
    if (data.partOfSpeech && !this.posOptions.includes(data.partOfSpeech)) {
      if (data.partOfSpeech.toLowerCase().includes("verb") && data.partOfSpeech.toLowerCase() !== "adverb")
        data.partOfSpeech = "verb";
      if (data.partOfSpeech.toLowerCase().includes("noun") && data.partOfSpeech.toLowerCase() !== "pronoun")
        data.partOfSpeech = "noun";
      if (data.partOfSpeech.toLowerCase().includes("adjective") && data.partOfSpeech.toLowerCase() !== "adjective")
        data.partOfSpeech = "adjective";
    }
    return data;
  }

  constructor(private http: HttpClient,
    public sharedService: SharedService,
    private router: Router,
    private commonOperations: CommonOperations,
    private headerDashBoardCommuter: HeaderDashboardCommuter,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.apiKey = this.sharedService.getWordsNikApiKey();
    this.apiVersion = this.sharedService.getWordsNikVersion();
    this.subs = this.headerDashBoardCommuter.fetchedData$.subscribe((data) => {
      if (data) {
        const ref = this.dialog.open(AddTheWordDialogComponent, {
          width: '600px',
          data: data
        });
      }
    });

    const url = `https://api.wordnik.com/${this.apiVersion}/words.json/randomWords?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=12&api_key=${this.apiKey}`;
    this.callWordsNikApis(url).subscribe({
      next: (response) => {
        this.randomWords = response;
      }, error: (error) => {
        const errorCode = error.status ? error.status : 500;
        const errorMessage = error.error.message ? error.error.message : "Internal server error";
        Swal.fire({
          icon: 'error',
          title: `Error - ${errorCode}`,
          text: `${errorMessage}`,
          confirmButtonText: 'Back to dashboard',
          showCancelButton: true,
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) this.router.navigateByUrl(`/dashboard`);
        });
      }
    });
  }

  async addWord(index: number, word: string) {
    let posarr: any[] = [];
    let examplesarr: any[] = [];
    if (!this.definitionsWithPartOfSpeech[index]) {
      await this.callWordsNikApiAndAddTheDefinitionsToList(index, word);
    }
    if (this.definitionsWithPartOfSpeech[index]) {
      for (let x of this.definitionsWithPartOfSpeech[index]) {
        if (x.partOfSpeech && this.posOptions.includes(x.partOfSpeech) && x.text) {
          let temp = posarr.find(obj => obj.partOfSpeech === x.partOfSpeech);
          if (temp) {
            temp.meaning = temp.meaning + " (OR) " + x.text.replace(/<[^>]*>/g, '');
          } else {
            posarr.push({ 'partOfSpeech': x.partOfSpeech, 'meaning': x.text.replace(/<[^>]*>/g, '') });
          }

          if (x.exampleUses && x.exampleUses.length > 0) {
            for (let example of x.exampleUses) {
              examplesarr.push({ description: example.text.replace(/<[^>]*>/g, '') });
            }
          }
        }
      }
    }

    if (posarr.length === 0) {
      this.toastMessage = "ERROR - parts of speech data not available for this word";
      this.showToast();
    } else {
      this.commonOperations.triggerActionForEdit({ partsOfSpeech: posarr, word: word, examples: examplesarr });
      this.router.navigateByUrl(`/addWord`);
    }
  }

  callWordsNikApis(url: string): Observable<any> {
    return this.http.get(url);
  }

  showToast() {
    const toastEl = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastEl!);
    toast.show();
  }

  ngOnDestroy() {
    if (this.subs) {
      this.subs.unsubscribe();
      this.headerDashBoardCommuter.clearTrigger();
    }
  }

}