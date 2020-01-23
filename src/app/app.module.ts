import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { MainViewerModule } from './main-viewer/main-viewer.module';

import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { NavComponent } from './nav/nav.component';
import { MainViewerComponent } from './main-viewer/main-viewer.component';
import { AdvancedEditViewerComponent } from './advanced-edit-viewer/advanced-edit-viewer.component';
import { ImpressComponent } from './impress/impress.component';
import { GameWindowComponent } from './game-window/game-window.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ModalComponent } from './modal/modal.component';
import { LoginComponent } from './login/login.component';

import { BasicAuthInterceptor } from './_helpers/basic-auth.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';

import { TreeModule } from 'angular-tree-component';


@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    NavComponent,
    MainViewerComponent,
    AdvancedEditViewerComponent,
    ImpressComponent,
    GameWindowComponent,
    SidebarComponent,
    ModalComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    MainViewerModule,
    ReactiveFormsModule,
	TreeModule.forRoot()
  ],
  providers: [
    Title,
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
