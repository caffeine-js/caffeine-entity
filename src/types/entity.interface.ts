import type { EntityContext, EntitySchema, EntitySource } from "@/symbols";
import type { IRawEntity } from "./raw-entity.interface";
import type { Schema } from "@caffeine/schema";
import type { TSchema } from "@sinclair/typebox";
import type { IValueObjectMetadata } from "@caffeine/value-objects/types";

export interface IEntity<SchemaType extends TSchema> extends IRawEntity {
	readonly [EntitySource]: string;
	readonly [EntitySchema]: Schema<SchemaType>;
	[EntityContext](name: string): IValueObjectMetadata;
}
