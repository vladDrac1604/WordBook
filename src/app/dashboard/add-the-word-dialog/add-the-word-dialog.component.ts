import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { SharedService } from 'src/app/shared-service';
declare var bootstrap: any;

@Component({
  selector: 'app-add-the-word-dialog',
  templateUrl: './add-the-word-dialog.component.html',
  styleUrls: ['./add-the-word-dialog.component.css']
})
export class AddTheWordDialogComponent implements OnInit {

  public word: string | null = null;
  public definitions: any = [];
  public examples: any = [];
  public note: any = null;
  wordOfTheDayAdded: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddTheWordDialogComponent>,
    private sharedService: SharedService,
    private http: HttpClient) {
    this.word = this.sharedService.capitalizeSentence(this.data.value.word);
    this.definitions = this.data.value.definitions;
    this.examples = this.data.value.examples;
    this.note = this.data.value.note ? this.data.value.note : null;
    if(this.note) {
      if(this.note[this.note.length - 1] === '.') {
        this.note = this.note.substring(0, this.note.length - 1);
      }
    }
  }

  prepareSavePayload() {
    let speechPartsArr: any = [];
    let examplesArr: any = [];
    let speechPartsMain: any = [];
    let payload = {};
    for (let x of this.definitions) {
      if (!speechPartsMain.includes(x.partOfSpeech)) {
        speechPartsMain.push(x.partOfSpeech);
        speechPartsArr.push({ type: x.partOfSpeech, description: x.text })
      }
    }
    for (let x of this.examples) {
      examplesArr.push({ description: x.text });
    }

    payload = {
      wordInput: this.word,
      speechParts: speechPartsArr,
      examples: examplesArr,
      synonyms: [],
      anonyms: []
    }
    return payload;
  }

  addWordOfTheDayIntoDictionary() {
    const payload = this.prepareSavePayload();
    this.http.post<any>(`http://localhost:3000/wordBook/addWord`, payload).subscribe((response) => {
      if (response.status === "SUCCESS") {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `The word ${this.word} has been added to dictionary`,
          confirmButtonText: 'OK'
        });
        this.wordOfTheDayAdded(response.data);
      } else if (response.status === "INFORMATION") {
        this.sharedService.infoPopup("Information!", response.message);
      } else {
        let message = response.message ? response.message : "Internal server error";
        this.sharedService.errorPopup("Error!", message);
      }
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

}
