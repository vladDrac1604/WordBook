import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddWordFormComponent } from './add-word-form/add-word-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent },
  { path: "addWord", component: AddWordFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
