import type { Static, TSchema } from "@sinclair/typebox";
import { ParseEntityToDTOService } from "./services";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { EntitySchema, EntitySource } from "./symbols";
import type { IEntity, IRawEntity } from "./types";

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
	toDomain: <SchemaType extends TSchema>(
		dto: Static<SchemaType>,
		factory: (
			data: Omit<Static<SchemaType>, keyof IRawEntity>,
			entityProps: IRawEntity,
		) => IEntity<SchemaType>,
	): IEntity<SchemaType> => {
		const { id, createdAt, updatedAt, ...content } = dto as IRawEntity &
			Record<string, unknown>;
		return factory(content as Omit<Static<SchemaType>, keyof IRawEntity>, {
			id,
			createdAt,
			updatedAt,
		});
	},
} as const;
