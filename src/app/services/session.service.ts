import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private sessionUpdatedSubject: Subject<any> = new Subject<any>();
    
    public sessionUpdates$ = this.sessionUpdatedSubject.asObservable();

    sessionUpdated(data: any) {
        this.sessionUpdatedSubject.next(data);
    }
}
