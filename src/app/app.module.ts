import { NgModule } from '@angular/core';
import { BrowserModule, Title} from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './admin/admin.component';
import { ModalComponent } from './modal/modal.component';
import { NavComponent } from './nav/nav.component';
import { FooterComponent } from './footer/footer.component';
import { MainViewerComponent } from './main-viewer/main-viewer.component';
import { GameWindowComponent } from './game-window/game-window.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TreeModule } from '@circlon/angular-tree-component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { ImpressComponent } from './impress/impress.component';

import { BasicAuthInterceptor } from './_helpers/basic-auth.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { ExperimentsComponent } from './experiments/experiments.component';
import { UserPasswordResetComponent } from './user-password-reset/user-password-reset.component';
import { DataTypesComponent } from './data-types/data-types.component';
//import { CodeEditorModule } from '@ngstack/code-editor';
import { DataTransformsComponent } from './data-transforms/data-transforms.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    ModalComponent,
    NavComponent,
    FooterComponent,
    MainViewerComponent,
    GameWindowComponent,
    EditUserComponent,
    SidebarComponent,
    LoginComponent,
    RegistrationComponent,
    ImpressComponent,
    ExperimentsComponent,
    UserPasswordResetComponent,
    DataTypesComponent,
    DataTransformsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    TreeModule,
   // CodeEditorModule.forRoot()
  ],
  providers: [
    Title,
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
