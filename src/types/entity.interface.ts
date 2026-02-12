import type { EntitySource } from "@/symbols";

export interface IEntity {
	readonly [EntitySource]: string;

	readonly id: string;
	readonly createdAt: string;
	readonly updatedAt?: string;
}
