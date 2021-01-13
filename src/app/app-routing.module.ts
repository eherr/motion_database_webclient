import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainViewerComponent } from './main-viewer/main-viewer.component';
import { AdvancedEditViewerComponent } from './advanced-edit-viewer/advanced-edit-viewer.component';
import { ImpressComponent } from './impress/impress.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { EditUserComponent } from './edit_user/edit_user.component';
import { UserPasswordResetComponent } from './user_password_reset/user_password_reset.component';
import { AdminComponent } from './admin/admin.component';

import { AuthGuard } from './_helpers/auth.guard';

const routes: Routes = [
  {
    path: 'impress',
    component: ImpressComponent,
    data: { title: 'Impress' }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Log In' }
  },
  {
    path: 'edit_user',
    component: EditUserComponent,
    data: { title: 'Edit User' }
  },
  {
    path: 'registration',
    component: RegistrationComponent,
    data: { title: 'Register User' }
  },
  {
    path: 'user_password_reset',
    component: UserPasswordResetComponent,
    data: { title: 'Reset User' }
  },
  {
    path: 'admin',
    component: AdminComponent,
    data: { title: 'Administration' }
  },
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
    path: 'advanced',
    component: AdvancedEditViewerComponent,
    canActivate: [AuthGuard], // this is required to protect the whole page!
    data: { }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(
                routes,
                { enableTracing: true } // <-- debugging purposes only
            )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
