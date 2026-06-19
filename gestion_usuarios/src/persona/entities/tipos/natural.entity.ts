import { ChildEntity, Column } from "typeorm";
import { Person } from "../persona.entity";

@ChildEntity('natural')
export class Natural extends Person{
    obtenerTipo(): string {
        return 'natural';
    }
}
