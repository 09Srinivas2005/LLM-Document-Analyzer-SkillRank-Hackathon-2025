import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UploadResponse, ClassifyResponse, AnalyzeResponse } from '../models';


@Injectable({ providedIn: 'root' })
export class ApiService {
private BASE = 'http://localhost:4000/api';
constructor(private http: HttpClient) {}


upload(file: File): Observable<UploadResponse> {
const form = new FormData();
form.append('file', file);
return this.http.post<UploadResponse>(`${this.BASE}/documents/upload`, form);
}
classify(docId: string): Observable<ClassifyResponse> {
return this.http.post<ClassifyResponse>(`${this.BASE}/documents/${docId}/classify`, {});
}
analyze(docId: string): Observable<AnalyzeResponse> {
return this.http.post<AnalyzeResponse>(`${this.BASE}/documents/${docId}/analyze`, {});
}
results(docId: string) {
return this.http.get(`${this.BASE}/documents/${docId}/results`);
}
}