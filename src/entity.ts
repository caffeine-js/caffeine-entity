import { InvalidEntityData } from "@caffeine/errors";
import type { IValueObjectMetadata } from "@caffeine/value-objects/types";
import type { EntityDTO } from "@/dtos";
import type { IEntity } from "./types";
import { EntitySchema } from "./schemas/entity.schema";

export abstract class Entity implements IEntity {
	public abstract readonly entitySource: string;

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
}
