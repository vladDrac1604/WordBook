import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removexmltags'
})
export class RemovexmltagsPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';
    return value.replace(/<[^>]*>/g, '');
  }

}
