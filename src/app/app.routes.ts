import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/pages/404/page-not-found.component';
import { AuthGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./auth/auth.routes')
    },
    {
        path: 'productos',
        loadChildren: () => import('./productos/listado-productos/productos.routes'),
        canActivate: [AuthGuard]  //si quiero que se ejecute el guard de autenticacion

    },
    {
        path: 'nuevoproducto',
        loadChildren: () => import('./productos/nuevo-producto/nuevo-producto.routes'),
        canActivate: [AuthGuard]
    },
    {
        path: 'producto',
        loadChildren: () => import('./productos/producto/producto.routes'),
        canActivate: [AuthGuard]
    },
    {
        path: 'proveedores',
        loadChildren: () => import('./proveedores/proveedores.routes'),
        canActivate: [AuthGuard]
    },
    {
        path: 'porcentajes',
        loadChildren: () => import('./porcentajes/porcentajes.routes'),
        canActivate: [AuthGuard]
    },
    {
        path: 'rubros',
        loadChildren: () => import('./rubros/rubros.routes'),
        canActivate: [AuthGuard]
    },
    {
        path: 'ventas',
        loadChildren: () => import('./ventas/ventas.routes'),
        canActivate: [AuthGuard]
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
