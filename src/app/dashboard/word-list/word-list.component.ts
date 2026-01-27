import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { CommonOperations } from '../CommonOperations.service';

@Component({
  selector: 'app-word-list',
  templateUrl: './word-list.component.html',
  styleUrls: ['./word-list.component.css']
})
export class WordListComponent implements OnInit, OnChanges {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() public wordsInput: any[] = [];
  @Input() public allWordsCount: number = 0;
  @Input() public wordCount: number = 0;
  @Input() public page: number = 0;
  @Input() public changePaginatorValues: any = null;
  @Input() public favouritesCount: number = 0;
  @Input() public searchedCount: number = 0;
  @Input() public changeTabToDefault: boolean = false;
  public paginatedWords: any[] = [];
  public pageSize: number = 5;
  @Output() public wordDeletedEvent = new EventEmitter<any>();
  @Output() public favouriteChangedEvent = new EventEmitter<any>();
  @Output() public changeDisplayWords = new EventEmitter<any>();
  private sort: boolean = true;

  constructor(private commonOperations: CommonOperations) { }

  ngOnChanges() {
    if(this.changePaginatorValues) {
      this.page = this.changePaginatorValues.pageNum;
      this.pageSize = this.changePaginatorValues.pageSize;
      this.paginator.pageIndex = this.changePaginatorValues.pageNum;
      this.paginator.firstPage();
    }

    if(this.wordsInput.length > 0) {
      if(this.sort) this.wordsInput.sort((a, b) => a.word.localeCompare(b.word));
      this.loadData();
    }
  }

  ngOnInit(): void {
    this.commonOperations.triggerForSettingDefaultViewSource$.subscribe((data) => {
      document.getElementById('btnradio1')?.click();
    })
  }

  changeView(changeEvent: any) {
    if(changeEvent === 'searched') {
      this.sort = false;
    } else {
      this.sort = true;
    }
    this.changeDisplayWords.emit(changeEvent);
  }

  loadData() {
    const startIndex = this.page * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedWords = this.wordsInput.slice(startIndex, endIndex);
  }

  onPageChange(event: any) {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  wordDeleted(data: any) {
    this.wordDeletedEvent.emit(data);
  }

  favouriteChanged(data: any) {
    this.favouriteChangedEvent.emit(data);
  } 

  searchWord(data: any) {
    this.commonOperations.triggerAction(data);
  }

}
