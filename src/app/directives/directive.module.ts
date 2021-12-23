import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollSpyDirective } from './scrollpy.directive';

@NgModule({
  declarations: [ScrollSpyDirective],
  imports: [CommonModule],
  exports: [ScrollSpyDirective],
  providers: []
})
export class DirectivesModule {}
