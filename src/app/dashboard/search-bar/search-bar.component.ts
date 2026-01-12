import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { CommonOperations } from '../CommonOperations.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {

  searchForm: any;
  displayErrorText: boolean = false;
  @Output() public foundData = new EventEmitter<any>();
  @Output() public navigateToAddForm = new EventEmitter<any>();
  private subs!: Subscription;

  constructor(private http: HttpClient,
    private commonOperations: CommonOperations) { }

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      searchInput: new FormControl(null, Validators.compose([
        Validators.pattern('^[A-Za-z\\s]+$'), Validators.required
      ]))
    });

    this.subs = this.commonOperations.triggerAction$.subscribe((data) => {
      this.searchForm.get('searchInput')?.setValue(data);
      this.findWord();
    })
  }

  refresh() {
    this.displayErrorText = false;
    this.searchForm.reset();
    this.foundData.emit([]);
    this.commonOperations.triggerForSettingDefaultView();
  }

  findWord() {
    if (this.searchForm.status === "INVALID") {
      this.displayErrorText = true;
    } else {
      this.displayErrorText = false;
      const searchTerm = this.searchForm.value["searchInput"];
      this.http.get<any>(`http://localhost:3000/wordBook/findWord/${searchTerm}`).subscribe((response) => {
        if (response.status === "INFORMATION") {
          Swal.fire({
            title: 'Information!',
            text: response.message,
            icon: 'warning',
            showDenyButton: true,
            confirmButtonText: 'Add this word ?',
            denyButtonText: 'Cancel',
          }).then((action) => {
            if (action.isConfirmed) {
              this.navigateToAddForm.emit(searchTerm);
            }
          });
        } else if (response.status === "SUCCESS") {
          this.foundData.emit(response.data);
        }
      })
    }
  }

}
