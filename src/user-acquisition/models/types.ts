export type AccessRequestProps = {
	id?: string
	created?: string
	name: string
	email: string
	message: string
}

export type UnmarshalledAccessRequest = {
	id: string
	created: string
	name: string
	email: string
	message: string

}