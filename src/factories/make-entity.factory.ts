import { generateUUID } from "@/helpers";
import type { IEntity } from "@caffeine/models/types";

export function makeEntityFactory(): IEntity {
	return {
		id: generateUUID(),
		createdAt: new Date().toISOString(),
		updatedAt: undefined,
	};
}
