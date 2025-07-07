import { Routes } from '@angular/router';
import { LayoutComponent } from 'app/shared/layout/layout.component';
import { ListadoComprasComponent } from './listado-compras/pages/listado-compras/listado-compras.component';


export const comprasRoutes: Routes = [
    {
        path: "",
        component: LayoutComponent,
        children: [
            {
                path: "",
                component: ListadoComprasComponent
            }
        ]
    }
]

export default comprasRoutes;