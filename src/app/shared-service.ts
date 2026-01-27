import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class SharedService {
  
  public emitter = new Subject<any>();
  data$ = this.emitter.asObservable();

  getWordsNikApiKey() {
    return "2fqti3esrkb64hsiegswvzjei1lnn9izi8c3uwsa2tupg8rtl";
  }

  getWordsNikVersion() {
    return "v4";
  }

  getRandomNumber(max: number): number {
    return Math.floor(Math.random() * max) + 1;
  }

  emitFromChildToParent(value: any) {
    this.emitter.next(value);
  } 

  getUnsplashKey() {
    return "M0IBer-h3noOVG3lX2vZRBerGBGWCfCLCHshPvz4X9M";
  }

  errorPopup(heading: string, message: string) {
    Swal.fire({
      title: heading,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }

  infoPopup(heading: string, message: string) {
    Swal.fire({
      title: heading,
      text: message,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  successPopup(heading: string, message: string) {
    Swal.fire({
      title: heading,
      text: message,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }


  capitalizeSentence(sentence: string) {
  if (!sentence) return '';
  sentence = sentence.trim();
  return sentence[0].toUpperCase() + sentence.slice(1);
  }

  getRandomPageNum() {
    const minCeiled = Math.ceil(20);
    const maxFloored = Math.floor(1);
    return (Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)).toString();
  }

}
