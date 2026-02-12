import type { IEntity } from "../entity.interface";

export interface ICanReadId<EntityType extends IEntity> {
	findById(id: string): Promise<EntityType | null>;
}
