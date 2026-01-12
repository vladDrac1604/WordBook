import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AddWordFormComponent } from './add-word-form/add-word-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { HttpClientModule } from '@angular/common/http';
import { WordListComponent } from './dashboard/word-list/word-list.component';
import { WordItemComponent } from './dashboard/word-list/word-item/word-item.component';
import { SearchBarComponent } from './dashboard/search-bar/search-bar.component';
import { MatDialogModule } from '@angular/material/dialog';
import { AddTheWordDialogComponent } from './dashboard/add-the-word-dialog/add-the-word-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    WordListComponent,
    WordItemComponent,
    SearchBarComponent,
    HeaderComponent,
    AddWordFormComponent,
    DashboardComponent,
    AddTheWordDialogComponent
  ],
  imports: [
    MatListModule,    
    MatDialogModule,
    MatBadgeModule,
    MatMenuModule,
    MatPaginatorModule,
    HttpClientModule,
    MatButtonModule,
    MatTabsModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserModule,
    AppRoutingModule,    
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
