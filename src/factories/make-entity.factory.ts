import { generateUUID } from "@/helpers";
import type { IEntity } from "@/types";

export function makeEntityFactory(): IEntity {
	return {
		id: generateUUID(),
		createdAt: new Date().toISOString(),
		updatedAt: undefined,
	};
}
