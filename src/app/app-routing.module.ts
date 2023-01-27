import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainViewerComponent } from './main-viewer/main-viewer.component';
import { AdminComponent } from './admin/admin.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { ImpressComponent } from './impress/impress.component';
import { ExperimentsComponent } from './experiments/experiments.component';
import { UserPasswordResetComponent } from './user-password-reset/user-password-reset.component';

const routes: Routes = [
  {
    path: '',
    component: MainViewerComponent,
    data: { }
  },
  {
    path: '8888',
    component: MainViewerComponent,
    data: { }
  },
  {
    path: 'admin',
    component: AdminComponent,
    data: { title: 'Administration' }
  },
  {
    path: 'edit_user',
    component: EditUserComponent,
    data: { title: 'Edit User' }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Login' }
  },
  {
    path: 'registration',
    component: RegistrationComponent,
    data: { title: 'Register User' }
  },
  {
    path: 'impress',
    component: ImpressComponent,
    data: { title: 'Impress' }
  },
  {
    path: 'experiments',
    component: ExperimentsComponent,
    data: { title: 'Experiments' }
  },
  {
    path: 'user_password_reset',
    component: UserPasswordResetComponent,
    data: { title: 'Reset User' }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
