import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/layout/layout.component';
import { ListadoProductosComponent } from './pages/listado-productos/listado-productos.component';


const productosRoutes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                component: ListadoProductosComponent
            }
        ]
    },
]

export default productosRoutes;