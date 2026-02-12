import type { Entity } from "@/entity";

export interface ICanReadSlug<EntityType extends Entity> {
	findBySlug(slug: string): Promise<EntityType>;
}
