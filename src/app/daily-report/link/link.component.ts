import { Component} from '@angular/core';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html'
})
export class LinkComponent {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }
}
