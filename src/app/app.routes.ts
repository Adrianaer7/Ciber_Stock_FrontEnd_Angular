import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/pages/404/page-not-found.component';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./auth/auth.routes')
    },
    {
        path: '404',
        component: PageNotFoundComponent
    },
    {
        path: '**',
        redirectTo: '404'
    }
];
