import type { IEntity } from "../entity.interface";

export interface ICanReadSlug<EntityType extends IEntity> {
	findBySlug(slug: string): Promise<EntityType>;
}
