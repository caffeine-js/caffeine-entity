import type { EntityDTO } from "@/dtos";
import { generateUUID } from "@/helpers";

export function makeEntity(): EntityDTO {
	return {
		id: generateUUID(),
		createdAt: new Date().toISOString(),
		updatedAt: undefined,
	};
}
