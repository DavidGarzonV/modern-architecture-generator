export default class EntityName{
	// Add more properties here
	private _property: string | number | boolean | Date | null | undefined;

	get property(): string | number | boolean | Date | null | undefined {
		return this._property;
	}

	set property(value: string | number | boolean | Date | null | undefined) {
		this._property = value;
	}
}