import { Entity } from "@utils/entity"
import { AccessRequestDto } from "../dto/access-request/access-request"
import { AccessRequestProps, UnmarshalledAccessRequest } from "../models/types"
import { accessRequestSchema } from "../schemas/access-request.schema"

export class AccessRequest extends Entity<AccessRequestProps> {
	private constructor({ id, created, ...props }: AccessRequestProps) {
		super(props, id, created)
	}

	public static create(props: AccessRequestDto): AccessRequest {
		const accessRequestProps: AccessRequestProps = {
			id: props.id ? props.id : undefined,
			email: props.email,
			name: props.name,
			message: props.message,
		}

		const instance: AccessRequest = new AccessRequest(accessRequestProps)
		instance.validate(accessRequestSchema)

		return instance
	}

	toInputDto(): UnmarshalledAccessRequest {
		return {
			id: this.id,
			created: this.created,
			email: this.props.email,
			name: this.props.name,
			message: this.props.message,
		}
	}
}