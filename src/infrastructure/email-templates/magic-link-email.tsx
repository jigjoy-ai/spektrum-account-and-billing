import React from "react"
import {
	Html,
	Head,
	Body,
	Container,
	Section,
	Text,
	Button,
	Hr,
	Preview,
} from "@react-email/components"

interface MagicLinkEmailProps {
	loginLink: string
	expirationInMinutes: number
}

export const MagicLinkEmail = ({ loginLink, expirationInMinutes }: MagicLinkEmailProps) => (
	<Html>
		<Head />
		<Preview>Your JigJoy login link</Preview>
		<Body style={body}>
			<Container style={container}>
				<Section style={logoSection}>
					<Text style={logoText}>JigJoy</Text>
				</Section>
				<Section style={content}>
					<Text style={heading}>Sign in to JigJoy</Text>
					<Text style={paragraph}>
						Click the button below to sign in to your account. This link will expire in{" "}
						{expirationInMinutes} minutes.
					</Text>
					<Section style={buttonSection}>
						<Button style={button} href={loginLink}>
							Sign in to JigJoy
						</Button>
					</Section>
					<Text style={paragraph}>
						If the button doesn't work, copy and paste this link into your browser:
					</Text>
					<Text style={link}>{loginLink}</Text>
					<Hr style={hr} />
					<Text style={footer}>
						If you didn't request this email, you can safely ignore it.
					</Text>
				</Section>
			</Container>
		</Body>
	</Html>
)

const body: React.CSSProperties = {
	backgroundColor: "#f6f9fc",
	fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

const container: React.CSSProperties = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "0",
	maxWidth: "560px",
	borderRadius: "8px",
	overflow: "hidden",
	marginTop: "40px",
	marginBottom: "40px",
	boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
}

const logoSection: React.CSSProperties = {
	backgroundColor: "#0f172a",
	padding: "24px 40px",
}

const logoText: React.CSSProperties = {
	color: "#ffffff",
	fontSize: "24px",
	fontWeight: "bold",
	margin: "0",
}

const content: React.CSSProperties = {
	padding: "40px",
}

const heading: React.CSSProperties = {
	fontSize: "22px",
	fontWeight: "bold",
	color: "#1a1a1a",
	margin: "0 0 16px 0",
}

const paragraph: React.CSSProperties = {
	fontSize: "15px",
	lineHeight: "24px",
	color: "#4a4a4a",
	margin: "0 0 16px 0",
}

const buttonSection: React.CSSProperties = {
	textAlign: "center" as const,
	margin: "24px 0",
}

const button: React.CSSProperties = {
	backgroundColor: "#6366f1",
	borderRadius: "6px",
	color: "#ffffff",
	fontSize: "15px",
	fontWeight: "600",
	textDecoration: "none",
	textAlign: "center" as const,
	padding: "12px 32px",
	display: "inline-block",
}

const link: React.CSSProperties = {
	fontSize: "13px",
	color: "#6366f1",
	wordBreak: "break-all",
	margin: "0 0 16px 0",
}

const hr: React.CSSProperties = {
	borderColor: "#e5e7eb",
	margin: "24px 0",
}

const footer: React.CSSProperties = {
	fontSize: "13px",
	color: "#9ca3af",
	margin: "0",
}
