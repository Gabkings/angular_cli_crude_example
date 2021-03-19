import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';

import { Product } from './product';

import { Observable } from 'rxjs';

import { throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private SERVER_URL = 'http://localhost:3000/products';

  public first: string = '';
  public prev: string = '';
  public next: string = '';
  public last: string = '';

  constructor(private httpClient: HttpClient) {}

  parseLinkHeader(header) {
    if (header.length == 0) {
      return;
    }

    let parts = header.split(',');
    var links = {};
    parts.forEach((p) => {
      let section = p.split(';');
      var url = section[0].replace(/<(.*)>/, '$1').trim();
      var name = section[1].replace(/rel="(.*)"/, '$1').trim();
      links[name] = url;
    });

    this.first = links['first'];
    this.last = links['last'];
    this.prev = links['prev'];
    this.next = links['next'];
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unkown Error';
    if (error.error instanceof ErrorEvent) {
      //clent side errors
      errorMessage = `Error : ${error.error.message}`;
    } else {
      //server side errors
      errorMessage = `Error code ${error.status} \n Message ${error.error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  public sendGetRequest() {
    // Add safe, URL encoded _page and _limit parameters
    return this.httpClient
      .get<Product[]>(this.SERVER_URL, {
        params: new HttpParams({ fromString: '_page=1&_limit=20' }),
        observe: 'response',
      })
      .pipe(
        retry(3),
        catchError(this.handleError),
        tap((res) => {
          console.log(res.headers.get('Link'));
          this.parseLinkHeader(res.headers.get('Link'));
        })
      );
  }

  public sendGetRequestToUrl(url: string) {
    return this.httpClient.get(url, { observe: 'response' }).pipe(
      retry(3),
      catchError(this.handleError),
      tap((res) => {
        console.log(res.headers.get('Link'));
        this.parseLinkHeader(res.headers.get('Link'));
      })
    );
  }
}
