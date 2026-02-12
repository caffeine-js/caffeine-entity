import { describe, expect, it } from "vitest";
import { Entity } from "./entity";
import type { EntityDTO } from "@/dtos";
import { InvalidEntityData } from "@caffeine/errors";
import { makeEntity } from "@/factories";
import { EntitySource, EntitySchema, EntityContext } from "@/symbols";
import type { IValueObjectMetadata } from "@caffeine/value-objects/types";
import type { IRawEntity } from "./types";

import { Type } from "@sinclair/typebox";
import { Schema } from "@caffeine/schema";

const TestDTO = Type.Object({
	id: Type.String(),
	createdAt: Type.String(),
	updatedAt: Type.Optional(Type.String()),
});
const TestSchema = Schema.make(TestDTO);

class TestEntity extends Entity<typeof TestDTO> {
	public readonly [EntitySource] = "test";
	public readonly [EntitySchema] = TestSchema;
	public constructor(data: EntityDTO) {
		super(data);
	}

	public [EntityContext](_propertyName: string): IValueObjectMetadata {
		return {} as IValueObjectMetadata;
	}

	public static create(data?: EntityDTO): TestEntity {
		const entityData = data ?? makeEntity();
		const preparedData = TestEntity.prepare(entityData);
		return new TestEntity(preparedData);
	}

	public touch(): void {
		this.update();
	}
}

describe("Entity", () => {
	it("should create a valid entity instance", () => {
		const data = makeEntity();
		const entity = new TestEntity(data);

		expect(entity.id).toBe(data.id);
		expect(entity.createdAt).toBe(new Date(data.createdAt).toISOString());
		if (data.updatedAt) {
			expect(entity.updatedAt).toBe(new Date(data.updatedAt).toISOString());
		}
		expect(entity[EntitySource]).toBe("test");
	});

	it("should normalize dates during construction", () => {
		// Test ensuring dates are ISO strings
		const date = new Date();
		const data = makeEntity();
		data.createdAt = date.toISOString();

		const entity = new TestEntity(data);
		expect(entity.createdAt).toBe(date.toISOString());
	});

	it("should throw InvalidEntityData if prepare receives invalid data", () => {
		const invalidData = { id: "invalid-uuid" } as IRawEntity;
		expect(() => TestEntity.create(invalidData)).toThrow(InvalidEntityData);
	});

	it("should update updatedAt field when update() is called", async () => {
		const entity = TestEntity.create();
		const originalUpdatedAt = entity.updatedAt;

		// Ensure strictly greater time
		await new Promise((resolve) => setTimeout(resolve, 10));

		entity.touch();

		expect(entity.updatedAt).toBeDefined();
		expect(new Date(entity.updatedAt!).getTime()).toBeGreaterThan(
			originalUpdatedAt ? new Date(originalUpdatedAt).getTime() : 0,
		);
	});

	it("should handle undefined updatedAt gracefully", () => {
		const data = makeEntity();
		data.updatedAt = undefined;
		const entity = new TestEntity(data);
		expect(entity.updatedAt).toBeUndefined();
	});

	it("should handle defined updatedAt correctly", () => {
		const now = new Date().toISOString();
		const data = makeEntity();
		data.updatedAt = now;
		const entity = new TestEntity(data);
		expect(entity.updatedAt).toBe(now);
	});
});
