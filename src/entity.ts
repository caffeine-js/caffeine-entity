import { InvalidEntityData } from "@caffeine/errors";
import type { IValueObjectMetadata } from "@caffeine/value-objects/types";
import type { EntityDTO } from "@/dtos";
import type { IEntity } from "./types";
import { EntitySchema as EntityBuildedSchema } from "./schemas";
import { EntitySource, EntitySchema, EntityContext } from "./symbols";
import type { TSchema } from "@sinclair/typebox";
import type { Schema } from "@caffeine/schema";

export abstract class Entity<SchemaType extends TSchema>
	implements IEntity<SchemaType>
{
	public abstract readonly [EntitySource]: string;
	public abstract readonly [EntitySchema]: Schema<SchemaType>;

	public readonly id: string;
	public readonly createdAt: string;
	public updatedAt?: string;

	protected constructor({ createdAt, id, updatedAt }: EntityDTO) {
		this.id = id;
		this.createdAt = new Date(createdAt).toISOString();
		this.updatedAt = updatedAt ? new Date(updatedAt).toISOString() : undefined;
	}

	protected static prepare(data: EntityDTO): EntityDTO {
		const isAValidEntity = EntityBuildedSchema.match(data);

		if (!isAValidEntity)
			throw new InvalidEntityData("Cannot build the target entity");

		return data;
	}

	protected update(): void {
		this.updatedAt = new Date().toISOString();
	}

	public abstract [EntityContext](name: string): IValueObjectMetadata;
}
