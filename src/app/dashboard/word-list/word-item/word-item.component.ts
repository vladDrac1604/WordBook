import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedService } from 'src/app/shared-service';
import Swal from 'sweetalert2';
import { CommonOperations } from '../../CommonOperations.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-word-item',
  templateUrl: './word-item.component.html',
  styleUrls: ['./word-item.component.css']
})
export class WordItemComponent implements OnInit {

  @Input() public wordData: any = null;
  @Output() public wordDeleted = new EventEmitter<any>();
  @Output() public favouriteChanged = new EventEmitter<any>();
  @Output() public searchWordEvent = new EventEmitter<any>();
  public accordionId: string | null = null;
  public accordionBSId: string | null = null;
  public accordionHeadingId: string | null = null;
  public accordionButtonId: string | null = null;
  public accordionTargetButtonId: string | null = null;
  public synonymsPresent: boolean = false;
  public anotonymsPresent: boolean = false;
  public speechPartsSeparated: any = null;

  constructor(public sharedService: SharedService,
    private commonOperations: CommonOperations,
    private router: Router,
    private http: HttpClient) { }

  ngOnInit(): void {
    this.accordionId = this.wordData.word + "ID";
    this.accordionBSId = "#" + this.accordionId;
    this.accordionHeadingId = this.wordData.word + "HeadId";
    this.accordionButtonId = this.wordData.word + "BtnId";
    this.accordionTargetButtonId = "#" + this.accordionButtonId;
    this.areSynonymsAndAntonymsPresent();
    this.processSpeechPartsData();
  }

  areSynonymsAndAntonymsPresent() {
    if (this.wordData.antonyms && this.wordData.antonyms.length > 0) {
      for (let x of this.wordData.antonyms) {
        if (x != null) {
          this.anotonymsPresent = true;
        }
      }
    }
    if (this.wordData.synonyms && this.wordData.synonyms.length > 0) {
      for (let x of this.wordData.synonyms) {
        if (x != null) {
          this.synonymsPresent = true;
        }
      }
    }
  }

  processSpeechPartsData() {
    let speechArray = [];
    for (let speech of this.wordData.partsOfSpeech) {
      speechArray.push(speech.partOfSpeech.toLowerCase());
    }
    this.speechPartsSeparated = speechArray.join("/");
  }

  favorite() {
    const payload = {
      id: this.wordData._id,
      action: this.wordData.favourite === "Y" ? "N" : "Y"
    }
    this.http.post<any>("http://localhost:3000/wordBook/favourite", payload).subscribe((response) => {
      if (response.status === "SUCCESS") {
        const updatedData = response.data;
        this.wordData.favourite = response.data.favourite;
        this.favouriteChanged.emit(updatedData);
      } else {
        const message = response.message ? response.message : "Internal server error";
        this.sharedService.errorPopup("Failure", message);
      }
    })
  }

  deleteWord() {
    Swal.fire({
      title: 'Information!',
      text: `Are you sure you want to remove ${this.wordData.word} ?`,
      icon: 'warning',
      showDenyButton: true,
      confirmButtonText: 'Proceed to delete',
      denyButtonText: 'Cancel',
    }).then((action) => {
      if (action.isConfirmed) {
        const payload = { 
          id: this.wordData._id,
          name: this.wordData.word
         };
        this.http.post<any>("http://localhost:3000/wordBook/delete", payload).subscribe((response) => {
          if (response.status === "SUCCESS") {
            this.wordDeleted.emit(this.wordData);
          } else {
            const message = response.message ? response.message : "Internal server error";
            this.sharedService.errorPopup("Failure", message);
          }
        })
      }
    });
  }

  editWord() {
    console.log(this.wordData);
    this.wordData.furtherAction = "EDIT";
    this.commonOperations.triggerActionForEdit(this.wordData);
    this.router.navigateByUrl(`/addWord`);
  }

  initiateSearch(searchWord: string) {
    this.searchWordEvent.emit(searchWord);
  }

}