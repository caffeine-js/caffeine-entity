import { InvalidEntityData } from "@caffeine/errors";
import type { IValueObjectMetadata } from "@caffeine/value-objects/types";
import type { EntityDTO } from "@/dtos";
import type { IEntity } from "./types";
import { EntitySchema as EntityBuildedSchema } from "./schemas";
import { EntitySource, EntitySchema, EntityContext } from "./symbols";
import type { TSchema } from "@sinclair/typebox";
import type { Schema } from "@caffeine/schema";
import { UuidVO, DateTimeVO } from "@caffeine/value-objects";

export abstract class Entity<SchemaType extends TSchema>
	implements IEntity<SchemaType>
{
	public abstract readonly [EntitySource]: string;
	public abstract readonly [EntitySchema]: Schema<SchemaType>;

	private _id: UuidVO;
	private _createdAt: DateTimeVO;
	private _updatedAt?: DateTimeVO;

	public get id(): string {
		return this._id.value;
	}

	public get createdAt(): string {
		return this._createdAt.value;
	}

	public get updatedAt(): string | undefined {
		return this._updatedAt?.value;
	}

	protected constructor({ createdAt, id, updatedAt }: EntityDTO) {
		this._id = UuidVO.make(id, this[EntityContext]("id"));
		this._createdAt = DateTimeVO.make(
			createdAt,
			this[EntityContext]("createdAt"),
		);
		this._updatedAt = updatedAt
			? DateTimeVO.make(updatedAt, this[EntityContext]("updatedAt"))
			: undefined;
	}

	protected static prepare(data: EntityDTO): EntityDTO {
		const isAValidEntity = EntityBuildedSchema.match(data);

		if (!isAValidEntity)
			throw new InvalidEntityData("Cannot build the target entity");

		return data;
	}

	protected update(): void {
		this._updatedAt = DateTimeVO.now(this[EntityContext]("updatedAt"));
	}

	public abstract [EntityContext](name: string): IValueObjectMetadata;
}
