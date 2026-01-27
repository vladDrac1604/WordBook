import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddWordFormComponent } from './add-word-form/add-word-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WordsGridComponent } from './words-grid/words-grid.component';

const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent },
  { path: "addWord", component: AddWordFormComponent },
  { path: "wordGrid", component: WordsGridComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
