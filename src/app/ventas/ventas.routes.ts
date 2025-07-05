import { Routes } from "@angular/router";
import { LayoutComponent } from "app/shared/layout/layout.component";
import { ListadoVentasComponent } from "./listado-ventas/pages/listado-ventas/listado-ventas.component";

const ventasRoutes: Routes = [
    {
        path: "",
        component: LayoutComponent,
        children: [
            {
                path: "",
                component: ListadoVentasComponent
            }
        ]
    }
]

export default ventasRoutes;