import { Entity } from "@utils/entity"
import { AccessRequestDto } from "../dto/access-request/access-request"
import { AccessRequestProps, UnmarshalledAccessRequest } from "../models/types"
import { accessRequestSchema } from "../schemas/access-request.schema"
import { v4 as uuidv4 } from "uuid"
import { ValidationError } from "@packages/errors/validation-error"

export class AccessRequest {

	public id: string
	public email: string
	public role: string
	public description: string
	public created: string

	private constructor(props: AccessRequestProps) {
		this.id = props.id
		this.email = props.email
		this.role = props.role
		this.description = props.description
		this.created = props.created
	}

	public static create(props: AccessRequestDto): AccessRequest {

		if (!props.email) {
			throw new ValidationError("Email is required")
		}

		const accessRequestProps: AccessRequestProps = {
			id: uuidv4(),
			email: props.email,
			role: props.role,
			description: props.description,
			created: new Date().toISOString(),
		}

		const instance: AccessRequest = new AccessRequest(accessRequestProps)

		return instance
	}

	toInputDto(): UnmarshalledAccessRequest {
		return {
			id: this.id,
			created: this.created,
			email: this.email,
			role: this.role,
			description: this.description,
		}
	}
}