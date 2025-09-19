import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';


@Component({
selector: 'app-upload',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './upload.component.html',
styleUrls: ['./upload.component.css']
})
export class UploadComponent {
file?: File;
preview = '';
uploading = false;
error = '';
docId = '';


constructor(private api: ApiService, private router: Router) {}


onFile(e: any) {
this.file = e.target.files?.[0];
}


async submit() {
this.error = '';
if (!this.file) { this.error = 'Choose a PDF'; return; }
this.uploading = true;
this.api.upload(this.file).subscribe({
next: (r) => {
this.uploading = false;
this.preview = r.text_preview;
this.docId = r.doc_id;
},
error: (err) => { this.uploading = false; this.error = err?.error?.error || 'Upload failed'; }
});
}


analyze() {
if (!this.docId) return;
this.api.classify(this.docId).subscribe({
next: () => {
this.api.analyze(this.docId).subscribe({
next: () => this.router.navigate(['/results', this.docId]),
error: (e) => this.error = e?.error?.error || 'Analyze failed'
});
},
error: (e) => this.error = e?.error?.error || 'Classify failed'
});
}
}