import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Recipe } from "./Recipe";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  role: string; // 'normal' or 'admin'

  @OneToMany(() => Recipe, (recipe) => recipe.user)
  recipes: Recipe[];
}
