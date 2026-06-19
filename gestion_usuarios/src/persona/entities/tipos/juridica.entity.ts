import { ChildEntity, Column } from "typeorm";
import { Person } from "../persona.entity";

@ChildEntity('juridica')
export class Juridica extends Person{
    obtenerTipo(): string {
        return 'juridica';
    }
}