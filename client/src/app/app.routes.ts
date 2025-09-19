import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
import { ResultsComponent } from './components/results/results.component';


export const routes: Routes = [
{ path: '', component: UploadComponent },
{ path: 'results/:id', component: ResultsComponent }
];