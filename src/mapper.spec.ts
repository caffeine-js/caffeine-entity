import { describe, expect, it } from "vitest";
import { Entity } from "./entity";
import { Mapper } from "./mapper";
import { ValueObject } from "@caffeine/value-objects/core";
import {
	Type,
	type TArray,
	type TObject,
	type TOptional,
	type TString,
} from "@sinclair/typebox";
import { Schema } from "@caffeine/schema";
import type { IValueObjectMetadata } from "@caffeine/value-objects/types";
import type { EntityDTO } from "@/dtos";
import { makeEntity } from "./factories";
import { EntitySource } from "./symbols";

// 1. Define Schema
const TestDTO = Type.Object({
	id: Type.String(),
	createdAt: Type.String(),
	updatedAt: Type.Optional(Type.String()),
	simpleField: Type.String(),
	computedField: Type.String(),
	valueObjectField: Type.String(),
	arrayField: Type.Array(Type.String()),
	arrayValueObjectField: Type.Array(Type.String()),
	nestedEntityLike: Type.Object({
		nested: Type.String(),
	}),
});
const TestSchema = Schema.make(TestDTO);

// 2. Define Value Object
class TestValueObject extends ValueObject<string, typeof TestDTO> {
	protected override schema: Schema<typeof TestDTO> = TestSchema;

	public static create(value: string): TestValueObject {
		return new TestValueObject(value, { name: "", source: "" });
	}
	protected override validate() {
		if (!this.schema.match(this.value)) throw new Error();
	}
}

// 3. Define Entity
class TestEntity extends Entity {
	public readonly [EntitySource] = "test";

	public simpleField: string;
	public valueObjectField: TestValueObject;
	public arrayField: string[];
	public arrayValueObjectField: TestValueObject[];

	// This property matches the schema but is a nested object
	public nestedEntityLike = {
		toDTO: () => ({ nested: "dto" }),
	};

	// Private/Internal properties that should be ignored
	public _privateProp = "secret";

	public constructor(
		data: EntityDTO & {
			simpleField?: string;
			valueObjectField?: TestValueObject;
			arrayField?: string[];
			arrayValueObjectField?: TestValueObject[];
		},
	) {
		super(data);
		this.simpleField = data.simpleField ?? "default";
		this.valueObjectField =
			data.valueObjectField ?? TestValueObject.create("vo-value");
		this.arrayField = data.arrayField ?? ["a", "b"];
		this.arrayValueObjectField = data.arrayValueObjectField ?? [
			TestValueObject.create("vo1"),
		];
	}

	public get computedField(): string {
		return `computed-${this.simpleField}`;
	}

	protected getPropertyContext(_propertyName: string): IValueObjectMetadata {
		return {} as IValueObjectMetadata;
	}

	public static create(
		data?: Partial<EntityDTO> & {
			simpleField?: string;
			valueObjectField?: TestValueObject;
			arrayField?: string[];
			arrayValueObjectField?: TestValueObject[];
		},
	): TestEntity {
		const baseData = makeEntity();
		return new TestEntity({ ...baseData, ...data });
	}
}

describe("Mapper", () => {
	it("should map basic entity fields", () => {
		const entity = TestEntity.create({ simpleField: "test-value" });
		const dto = Mapper.toDTO(entity, TestSchema);

		expect(dto.id).toBe(entity.id);
		expect(dto.createdAt).toBe(entity.createdAt);
		expect(dto.simpleField).toBe("test-value");
	});

	it("should map getters", () => {
		const entity = TestEntity.create({ simpleField: "test" });
		const dto = Mapper.toDTO(entity, TestSchema);
		expect(dto.computedField).toBe("computed-test");
	});

	it("should map ValueObjects to their values", () => {
		const vo = TestValueObject.create("custom-vo");
		const entity = TestEntity.create({ valueObjectField: vo });
		const dto = Mapper.toDTO(entity, TestSchema);
		expect(dto.valueObjectField).toBe("custom-vo");
	});

	it("should map arrays of primitives", () => {
		const arr = ["x", "y"];
		const entity = TestEntity.create({ arrayField: arr });
		const dto = Mapper.toDTO(entity, TestSchema);
		expect(dto.arrayField).toEqual(["x", "y"]);
	});

	it("should map arrays of ValueObjects", () => {
		const arr = [TestValueObject.create("1"), TestValueObject.create("2")];
		const entity = TestEntity.create({ arrayValueObjectField: arr });
		const dto = Mapper.toDTO(entity, TestSchema);
		expect(dto.arrayValueObjectField).toEqual(["1", "2"]);
	});

	it("should map nested objects with toDTO method", () => {
		const entity = TestEntity.create();
		const dto = Mapper.toDTO(entity, TestSchema);
		expect(dto.nestedEntityLike).toEqual({ nested: "dto" });
	});

	it("should ignore internal properties starting with double underscore", () => {
		const entity = TestEntity.create();
		const dto = Mapper.toDTO(entity, TestSchema);
		// @ts-expect-error - testing runtime behavior of stripping internal props
		expect(dto.__source).toBeUndefined();
		// @ts-expect-error - testing runtime behavior
		expect(dto.__schema).toBeUndefined();
	});

	it("should include properties starting with single underscore but strip the underscore from key", () => {
		const entity = TestEntity.create();
		const dto = Mapper.toDTO(entity, TestSchema);

		// The property is _privateProp on the entity
		// The mapper logic: const finalKey = key.startsWith("_") ? key.slice(1) : key;
		// So _privateProp becomes privateProp in DTO

		// @ts-expect-error - DTO type definition might not know about this dynamic mapping perfectly without schema adjustment
		expect(dto.privateProp).toBe("secret");

		// Ensure the original key is NOT present
		// @ts-expect-error
		expect(dto._privateProp).toBeUndefined();
	});
});
