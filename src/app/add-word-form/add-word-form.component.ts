import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../shared-service';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonOperations } from '../dashboard/CommonOperations.service';
import { skip, Subscription, takeUntil } from 'rxjs';
import { HeaderDashboardCommuter } from '../HeaderDashboardCommuter.service';

@Component({
  selector: 'app-add-word-form',
  templateUrl: './add-word-form.component.html',
  styleUrls: ['./add-word-form.component.css']
})
export class AddWordFormComponent implements OnInit {

  private editSub!: Subscription;
  wordForm: any;
  options: any[] = [];
  public selectedTabIndex: number = 0;
  public inputWord: string | null = null;
  public isEditEnabled: boolean = false;
  private idForEdit: string | null = null;

  initializeOptions() {
    this.options = [
      { label: 'Noun', value: 'noun', selected: false },
      { label: 'Verb', value: 'verb', selected: false },
      { label: 'Adverb', value: 'adverb', selected: false },
      { label: 'Adjective', value: 'adjective', selected: false },
      { label: 'Pronoun', value: 'pronoun', selected: false }
    ];
  }

  toggleOption(option: any) {
    option.selected = !option.selected;
    if (option.selected) {
      this.onAddMeaning(option.label);
    } else {
      const index = this.wordForm.get('speechParts').value.findIndex((data: { type: any; }) => data.type == option.label);
      if (index !== -1) {
        (<FormArray>this.wordForm.get('speechParts')).removeAt(index);
      } else {
        console.log("cannot find the option to remove from selected list");
      }
    }
  }

  get synonymControls() {
    return (<FormArray>this.wordForm.get('synonyms')).controls;
  }

  get anonymControls() {
    return (<FormArray>this.wordForm.get('anonyms')).controls;
  }

  get partsOfSpeechControls() {
    return (<FormArray>this.wordForm.get('speechParts')).controls;
  }

  get exampleControls() {
    return (<FormArray>this.wordForm.get('examples')).controls;
  }

  onRemoveAntonym(index: number) {
    (<FormArray>this.wordForm.get('anonyms')).removeAt(index);
  }

  onRemoveSynonym(index: number) {
    (<FormArray>this.wordForm.get('synonyms')).removeAt(index);
  }

  removeExample(index: number) {
    (<FormArray>this.wordForm.get('examples')).removeAt(index);
  }

  onAddSynonym() {
    if (this.wordForm.value.synonyms.length === 4) {
      this.sharedService.infoPopup("INFORMATION", "You cannot add more than four synonyms per word");
    } else {
      (<FormArray>this.wordForm.get('synonyms')).push(
        new FormGroup({
          'value': new FormControl(null, Validators.required)
        })
      );
    }
  }

  onAddAnonym() {
    if (this.wordForm.value.anonyms.length === 4) {
      this.sharedService.infoPopup("INFORMATION", "You cannot add more than four antonyms per word");
    } else {
      (<FormArray>this.wordForm.get('anonyms')).push(
        new FormGroup({
          'value': new FormControl(null, Validators.required)
        })
      );
    }
  }

  onAddExample() {
    if (this.wordForm.value.examples.length === 3) {
      this.sharedService.infoPopup("INFORMATION", "You cannot add more than three examples per word");
    } else {
      (<FormArray>this.wordForm.get('examples')).push(
        new FormGroup({
          'description': new FormControl(null, Validators.required)
        })
      );
    }
  }

  onAddMeaning(type: string) {
    (<FormArray>this.wordForm.get('speechParts')).push(
      new FormGroup({
        'type': new FormControl(type, Validators.required),
        'description': new FormControl(null, Validators.required)
      })
    );
  }

  get selectedLabels(): string {
    return this.options
      .filter(o => o.selected)
      .map(o => o.label)
      .join(', ');
  }

  cancelEdit() {
    this.idForEdit = null;
    this.isEditEnabled = false;
    this.onReset();
  }

  constructor(private sharedService: SharedService,
    private http: HttpClient,
    private router: Router,
    private commonOperations: CommonOperations,
    private headerDashboardCommuter: HeaderDashboardCommuter,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (params["word"]) {
        this.inputWord = params["word"];
      }
    })

    this.initializeOptions();
    this.wordForm = new FormGroup({
      wordInput: new FormControl(this.inputWord, Validators.required),
      speechParts: new FormArray([]),
      examples: new FormArray([]),
      synonyms: new FormArray([]),
      anonyms: new FormArray([])
    });
    this.onAddExample();
    this.onAddAnonym();
    this.onAddSynonym();

    this.editSub = this.commonOperations.triggerActionSourceForEdit$.subscribe((data) => {
      if (data && data.furtherAction === "EDIT") {
        this.idForEdit = data._id;
        this.isEditEnabled = true;
      }
      this.initializeValuesForEdit(data);
    })
  }

  saveEditChanges() {
    const payload = {
      id: this.idForEdit,
      wordInput: this.wordForm.value.wordInput,
      speechParts: this.wordForm.value.speechParts,
      examples: this.wordForm.value.examples,
      synonyms: this.wordForm.value.synonyms,
      anonyms: this.wordForm.value.anonyms
    }
    this.http.post<any>(`http://localhost:3000/wordBook/editWordData`, payload).subscribe((response) => {
      console.log(response);
      if(response.status === "SUCCESS") {
        const data = { action: "editSuccess" };
        this.headerDashboardCommuter.triggerAction(data);
        this.router.navigateByUrl(`/dashboard`);
      } else if(response.status === "INFORMATION") {
        this.sharedService.infoPopup("Information", response.message);
      } else {
        this.sharedService.errorPopup("Failure", response.message ? response.message : "Internal server error");
      }
    })
  }

  initializeValuesForEdit(data: any) {
    this.inputWord = data.word;
    this.wordForm.get("wordInput").setValue(data.word);
    const tempAntonyms = this.wordForm.get('anonyms') as FormArray;
    const tempSynonyms = this.wordForm.get('synonyms') as FormArray;
    const tempExamples = this.wordForm.get('examples') as FormArray;
    tempAntonyms.clear();
    tempSynonyms.clear();
    tempExamples.clear();
    for (let x of data.partsOfSpeech) {
      (<FormArray>this.wordForm.get('speechParts')).push(
        new FormGroup({
          'type': new FormControl(x.partOfSpeech, Validators.required),
          'description': new FormControl(x.meaning, Validators.required)
        })
      );
      this.options = this.options.map(option =>
        option.label.toLowerCase() === x.partOfSpeech.toLowerCase() ? { ...option, selected: !option.selected } : option
      );
    }
    if (data.examples && data.examples.length > 0) {
      for (let x of data.examples) {
        (<FormArray>this.wordForm.get('examples')).push(
          new FormGroup({ 'description': new FormControl(x.description, Validators.required) })
        );
      }
    }
    if (data.antonyms && data.antonyms.length > 0) {
      for (let x of data.antonyms) {
        (<FormArray>this.wordForm.get('anonyms')).push(
          new FormGroup({ 'value': new FormControl(x, Validators.required) })
        );
      }
    }
    if (data.synonyms && data.synonyms.length > 0) {
      for (let x of data.synonyms) {
        (<FormArray>this.wordForm.get('synonyms')).push(
          new FormGroup({ 'value': new FormControl(x, Validators.required) })
        );
      }
    }
  }

  onReset() {
    // resetting every single form array in wordForm
    const speechPartsArray = this.wordForm.get('speechParts') as FormArray;
    const examplesArray = this.wordForm.get('examples') as FormArray;
    const synonymsArray = this.wordForm.get('synonyms') as FormArray;
    const antonymsArray = this.wordForm.get('anonyms') as FormArray;
    speechPartsArray.clear();
    examplesArray.clear();
    synonymsArray.clear();
    antonymsArray.clear();
    this.wordForm.reset();

    // initializing form arrays with one input only
    this.initializeOptions();
    this.onAddExample();
    this.onAddAnonym();
    this.onAddSynonym();
  }

  checkForEmptyAntonymsAndSynonyms() {
    let synonymEmpty = true;
    let antonymEmpty = true;
    if (this.wordForm.get('synonyms').value.length == 0) {
      synonymEmpty = true;
    } else {
      for (let x of this.wordForm.get('synonyms').value) {
        if (x.value != null) {
          synonymEmpty = false;
        }
      }
    }
    if (this.wordForm.get('anonyms').value.length == 0) {
      antonymEmpty = true;
    } else {
      for (let x of this.wordForm.get('anonyms').value) {
        if (x.value != null) {
          antonymEmpty = false;
        }
      }
    }

    if (antonymEmpty && synonymEmpty) {
      return true;
    } else {
      return false;
    }
  }

  disableSaveButton() {
    if ((this.wordForm.value.wordInput === null || this.wordForm.value.wordInput === "") 
      || (this.wordForm.value.speechParts.length === 0) || (this.wordForm.value.examples.length === 0)) {
      return true;
    }
    if (this.wordForm.value.speechParts.length > 0) {
      for (let speech of this.wordForm.value.speechParts) {
        if (speech.description === null || speech.description === "") {
          return true;
        }
      }
    }
    if (this.wordForm.value.examples.length > 0) {
      for (let example of this.wordForm.value.examples) {
        if (example.description === null || example.description === "") {
          return true;
        }
      }
    }
    return false;
  }

  submitForm() {
    if (this.checkForEmptyAntonymsAndSynonyms()) {
      Swal.fire({
        title: 'Information!',
        text: 'Please add at least one synonym or antonym',
        icon: 'warning',
        showDenyButton: true,
        confirmButtonText: 'Proceed without adding',
        denyButtonText: 'Add a synonym/antonym',
      }).then((action) => {
        if (action.isConfirmed) {
          this.proceedToSave();
        } else {
          this.selectedTabIndex = 1;
        }
      })
    } else {
      this.proceedToSave();
    }
  }

  proceedToSave() {
    this.http.post<any>(`http://localhost:3000/wordBook/addWord`, this.wordForm.value).subscribe((response) => {
      if (response.status === "SUCCESS") {
        Swal.fire({
          title: 'Success!',
          text: response.message,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Go to Dashboard',
          cancelButtonText: 'Add more words',
          reverseButtons: true
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigateByUrl(`/dashboard`);
          } else {
            this.onReset();
          }
        })
      } else if (response.status === "INFORMATION") {
        this.sharedService.infoPopup("Information!", response.message);
      } else {
        let message = response.message ? response.message : "Internal server error";
        this.sharedService.errorPopup("Error!", message);
      }
    })
  }

  removeChip(value: any) {
    const option = this.options.find(option => option.label === value);
    option.selected = false;
    const index = this.wordForm.get('speechParts').value.findIndex((data: { type: any; }) => data.type == value);
    if (index != -1) {
      (<FormArray>this.wordForm.get('speechParts')).removeAt(index);
    }
  }

  ngOnDestroy() {
    if (this.editSub) {
      this.cancelEdit();
      this.editSub.unsubscribe();
      this.commonOperations.clearEditAction();
    }
  }

}
