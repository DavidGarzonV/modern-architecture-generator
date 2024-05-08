export type Property = {
	name: string
	type: string
}

export type CreateEntityOptions = {
	name: string
	useContext: boolean
	contextName?: string
	useClass?: boolean
	defaultProperties?: Property[]
}