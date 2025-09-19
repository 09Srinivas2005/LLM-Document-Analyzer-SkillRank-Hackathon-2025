import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';


@Component({
selector: 'app-results',
standalone: true,
imports: [CommonModule],
templateUrl: './results.component.html',
styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
loading = true;
data: any;
constructor(private route: ActivatedRoute, private api: ApiService) {}
ngOnInit() {
const id = this.route.snapshot.paramMap.get('id')!;
this.api.results(id).subscribe({
next: (d) => { this.data = d; this.loading = false; },
error: (e) => { this.data = { error: e?.error?.error || 'Error' }; this.loading = false; }
});
}
}