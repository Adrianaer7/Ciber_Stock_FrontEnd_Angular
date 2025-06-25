import { Routes } from '@angular/router';
import { LayoutComponent } from '../shared/layout/layout.component';
import { ListadoProveedoresComponent } from './listado-proveedores/pages/listado-proveedores/listado-proveedores.component';



const proveedoresRoutes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                component: ListadoProveedoresComponent
            }
        ]
    },
]

export default proveedoresRoutes;