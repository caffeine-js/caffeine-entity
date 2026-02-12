import type { Static, TSchema } from "@sinclair/typebox";
import { ParseEntityToDTOService } from "./services";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { EntitySchema, EntitySource } from "./symbols";
import type { IEntity } from "./types";

export const Mapper = {
	toDTO: <SchemaType extends TSchema>(
		data: IEntity<SchemaType>,
	): Static<SchemaType> => {
		const entityMapped = ParseEntityToDTOService.run<
			SchemaType,
			IEntity<SchemaType>
		>(data);

		if (!data[EntitySchema].match(entityMapped))
			throw new InvalidDomainDataException(data[EntitySource]);

		return entityMapped;
	},
} as const;
