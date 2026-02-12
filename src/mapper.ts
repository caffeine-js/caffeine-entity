import type { Static, TSchema } from "@sinclair/typebox";
import { ParseEntityToDTOService } from "./services";
import type { Schema } from "@caffeine/schema";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { EntitySource } from "./symbols";
import type { IEntity } from "./types";

export const Mapper = {
	toDTO: <SchemaType extends TSchema, EntityType extends IEntity>(
		data: EntityType,
		schema: Schema<SchemaType>,
	): Static<SchemaType> => {
		const entityMapped = ParseEntityToDTOService.run<SchemaType>(data);

		if (!schema.match(entityMapped))
			throw new InvalidDomainDataException(data[EntitySource]);

		return entityMapped;
	},
} as const;
