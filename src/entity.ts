import { InvalidEntityData } from "@caffeine/errors";
import type { IValueObjectMetadata } from "@caffeine/value-objects/types";
import type { EntityDTO } from "@/dtos";
import type { IEntity } from "./types";
import { EntitySchema } from "./schemas/entity.schema";
import type { Schema } from "@caffeine/schema";
import type { TSchema, Static } from "@sinclair/typebox";

import { ParseEntityToDTOService } from "@/services";

export abstract class Entity<SchemaType extends TSchema> implements IEntity {
	public abstract readonly __source: string;
	protected abstract readonly __schema: Schema<SchemaType>;

	public readonly id: string;
	public readonly createdAt: string;
	public updatedAt?: string;

	protected constructor({ createdAt, id, updatedAt }: EntityDTO) {
		this.id = id;
		this.createdAt = new Date(createdAt).toISOString();
		this.updatedAt = updatedAt ? new Date(updatedAt).toISOString() : undefined;
	}

	protected static prepare(data: EntityDTO): EntityDTO {
		const isAValidEntity = EntitySchema.match(data);

		if (!isAValidEntity)
			throw new InvalidEntityData("Cannot build the target entity");

		return data;
	}

	protected update(): void {
		this.updatedAt = new Date().toISOString();
	}

	protected abstract getPropertyContext(
		propertyName: string,
	): IValueObjectMetadata;

	public toDTO(): Static<SchemaType> {
		return ParseEntityToDTOService.run(this);
	}
}
