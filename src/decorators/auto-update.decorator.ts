import type { Entity } from "@/entity";

export function AutoUpdate<T extends Entity>(
	_target: T,
	_propertyKey: string,
	descriptor: PropertyDescriptor,
): PropertyDescriptor {
	const originalMethod = descriptor.value;

	descriptor.value = function (this: Entity, ...args: unknown[]) {
		const result = originalMethod.apply(this, args);
		this.update();
		return result;
	};

	return descriptor;
}
