import { Entity } from "@/entity";
import type { IEntity } from "@/types";
import { Schema } from "@caffeine/schema";
import { ValueObject } from "@caffeine/value-objects/core";
import type { TSchema, Static } from "@sinclair/typebox";

export const ParseEntityToDTOService = {
	run: <SchemaType extends TSchema, EntityType extends IEntity<SchemaType>>(
		entity: EntityType,
	): Static<SchemaType> => {
		const dto: Record<string, unknown> = {};

		Object.entries(entity).forEach(([key, value]) => {
			if (!key.startsWith("__")) {
				const finalKey = key.startsWith("_") ? key.slice(1) : key;
				dto[finalKey] = value;
			}
		});

		const proto = Object.getPrototypeOf(entity);
		const descriptors = Object.getOwnPropertyDescriptors(proto);

		Object.entries(descriptors).forEach(([key, descriptor]) => {
			if (typeof descriptor.get === "function" && !key.startsWith("__")) {
				const finalKey = key.startsWith("_") ? key.slice(1) : key;

				dto[finalKey] = (entity as unknown as Record<string, unknown>)[key];
			}
		});

		const processValue = (value: unknown): unknown => {
			if (value === null) return value;

			if (Array.isArray(value)) return value.map(processValue);
			if (value instanceof ValueObject) return value.value;
			if (value instanceof Schema) return value.toString();
			if (value instanceof Entity) return ParseEntityToDTOService.run(value);
			if (
				typeof value === "object" &&
				"toDTO" in value! &&
				typeof (value as { toDTO: () => unknown }).toDTO === "function"
			)
				return (value as { toDTO: () => unknown }).toDTO();

			return value;
		};

		return Object.fromEntries(
			Object.entries(dto).map(([key, value]) => [key, processValue(value)]),
		) as Static<SchemaType>;
	},
} as const;
