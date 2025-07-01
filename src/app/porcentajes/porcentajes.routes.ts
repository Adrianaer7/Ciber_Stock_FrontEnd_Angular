import { Routes } from "@angular/router";
import { ListadoPorcentajesComponent } from "./listado-porcentajes/pages/listado-porcentajes/listado-porcentajes.component";
import { LayoutComponent } from "app/shared/layout/layout.component";

const porcentajesRoutes: Routes = [
    {
        path: "",
        component: LayoutComponent,
        children: [
            {
                path: "",
                component: ListadoPorcentajesComponent
            }
        ]
    }
]

export default porcentajesRoutes;