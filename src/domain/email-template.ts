export class EmailTemplate {
    constructor(
      private readonly name: string,
      private readonly props: Record<string, string>
    ) {}

    getName(): string {
        return this.name
    }

    getProps(): Record<string, string> {
        return this.props
    }
}