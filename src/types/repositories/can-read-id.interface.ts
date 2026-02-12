import type { Entity } from "@/entity";

export interface ICanReadId<EntityType extends Entity> {
	findById(id: string): Promise<EntityType>;
}
