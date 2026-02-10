import { describe, expect, it } from "vitest";
import { v7 } from "uuid";
import { Entity } from "./entity";
import type { EntityDTO } from "@/dtos";
import { InvalidEntityData } from "@caffeine/errors";
import { makeEntityFactory } from "./factories";

class TestEntity extends Entity {
	public constructor(data: EntityDTO) {
		super(data);
	}

	public unpack(): EntityDTO {
		return {
			id: this.id,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	public static create(data?: EntityDTO): TestEntity {
		const entityData = data ?? makeEntityFactory();
		const preparedData = TestEntity.prepare(entityData);
		return new TestEntity(preparedData);
	}

	public touch(): void {
		this.update();
	}
}

describe("Entity", () => {
	it("should create a valid entity with defaults (using makeEntityFactory)", () => {
		const entity = TestEntity.create();
		expect(entity.id).toBeDefined();
		expect(typeof entity.id).toBe("string");
		expect(entity.createdAt).toBeTypeOf("string");
		expect(entity.updatedAt).toBeUndefined();
	});

	it("should accept valid custom values", () => {
		const id = v7();
		const createdAt = new Date().toISOString();
		const updatedAt = new Date().toISOString();

		const entity = TestEntity.create({ id, createdAt, updatedAt });

		expect(entity.id).toBe(id);
		expect(entity.createdAt).toEqual(new Date(createdAt).toISOString());
		expect(entity.updatedAt).toEqual(new Date(updatedAt).toISOString());
	});

	it("should accept valid custom values without updatedAt", () => {
		const id = v7();
		const createdAt = new Date().toISOString();

		const entity = TestEntity.create({ id, createdAt });

		expect(entity.id).toBe(id);
		expect(entity.createdAt).toEqual(new Date(createdAt).toISOString());
		expect(entity.updatedAt).toBeUndefined();
	});

	it("should throw InvalidEntityData for invalid UUID", () => {
		expect(() => {
			TestEntity.create({
				id: "invalid-uuid",
				createdAt: new Date().toISOString(),
			});
		}).toThrow(InvalidEntityData);
	});

	it("should throw InvalidEntityData for invalid createdAt date", () => {
		expect(() => {
			TestEntity.create({
				id: v7(),
				createdAt: "invalid-date",
			});
		}).toThrow(InvalidEntityData);
	});

	it("should throw InvalidEntityData for invalid updatedAt date", () => {
		expect(() => {
			TestEntity.create({
				id: v7(),
				createdAt: new Date().toISOString(),
				updatedAt: "invalid-date",
			});
		}).toThrow(InvalidEntityData);
	});
	it("should unpack the entity to a DTO", () => {
		const id = v7();
		const createdAt = new Date().toISOString();
		const updatedAt = new Date().toISOString();

		const entity = TestEntity.create({ id, createdAt, updatedAt });
		const unpacked = entity.unpack();

		expect(unpacked).toEqual({
			id,
			createdAt: new Date(createdAt).toISOString(),
			updatedAt: new Date(updatedAt).toISOString(),
		});
	});

	it("should update the updatedAt field when update is called", async () => {
		const entity = TestEntity.create();
		expect(entity.updatedAt).toBeUndefined();

		entity.touch();

		expect(entity.updatedAt).toBeDefined();
		expect(typeof entity.updatedAt).toBe("string");
		expect(new Date(entity.updatedAt!).getTime()).not.toBeNaN();
	});

	it("should update the updatedAt field to a newer date", async () => {
		const id = v7();
		const oldDate = new Date("2020-01-01").toISOString();
		const entity = TestEntity.create({
			id,
			createdAt: oldDate,
			updatedAt: oldDate,
		});

		expect(entity.updatedAt).toBe(new Date(oldDate).toISOString());

		await new Promise((resolve) => setTimeout(resolve, 10));
		entity.touch();

		expect(new Date(entity.updatedAt!).getTime()).toBeGreaterThan(
			new Date(oldDate).getTime(),
		);
	});
});
