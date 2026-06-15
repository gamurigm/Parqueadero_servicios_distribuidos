import { Column, Entity, PrimaryGeneratedColumn, TableInheritance } from "typeorm";

export enum Calsificacion {
  ELECTRICO = 'electrico',
  DIESEL = 'diesel',
  GASOLINA = 'gasolina',
  HIBRIDO = 'hibrido',
}

@Entity('vehiculos')
@TableInheritance({ column: { type: 'varchar', name: 'tipo' } })
export abstract class Vehiculo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: false,
  })
  placa: string;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column()
  color!: string;

  @Column()
  anio: number;

  @Column({ type: 'enum', enum: Calsificacion })
  clasificacion: Calsificacion;

  abstract obtenerTipoCombustion(): string;

}
