import React from "react"
import { describe, it, expect } from "@rstest/core"
import { renderToStaticMarkup } from "react-dom/server"
import { MagicLinkEmail } from "@infra/email-templates/magic-link-email"

describe("MagicLinkEmail Template", () => {
	const defaultProps = {
		loginLink: "https://app.jigjoy.ai/login?token=abc123",
		expirationInMinutes: 5,
	}

	it("should render valid HTML", () => {
		const html = renderToStaticMarkup(React.createElement(MagicLinkEmail, defaultProps))

		expect(html).toContain("<html")
		expect(html).toContain("</html>")
		expect(html).toContain("<body")
	})

	it("should include the login link in the button", () => {
		const html = renderToStaticMarkup(React.createElement(MagicLinkEmail, defaultProps))

		expect(html).toContain(defaultProps.loginLink)
		expect(html).toContain(`href="${defaultProps.loginLink}"`)
	})

	it("should include the login link as plaintext fallback", () => {
		const html = renderToStaticMarkup(React.createElement(MagicLinkEmail, defaultProps))

		// The link appears both in the button and in plaintext
		const occurrences = html.split(defaultProps.loginLink).length - 1
		expect(occurrences).toBeGreaterThanOrEqual(2)
	})

	it("should include the expiration time", () => {
		const html = renderToStaticMarkup(React.createElement(MagicLinkEmail, defaultProps))

		expect(html).toContain("5 minutes")
	})

	it("should handle different expiration times", () => {
		const props = { ...defaultProps, expirationInMinutes: 30 }
		const html = renderToStaticMarkup(React.createElement(MagicLinkEmail, props))

		expect(html).toContain("30 minutes")
	})

	it("should include JigJoy branding", () => {
		const html = renderToStaticMarkup(React.createElement(MagicLinkEmail, defaultProps))

		expect(html).toContain("JigJoy")
		expect(html).toContain("Sign in to JigJoy")
	})

	it("should include email preview text", () => {
		const html = renderToStaticMarkup(React.createElement(MagicLinkEmail, defaultProps))

		expect(html).toContain("Your JigJoy login link")
	})

	it("should include the safety disclaimer", () => {
		const html = renderToStaticMarkup(React.createElement(MagicLinkEmail, defaultProps))

		expect(html).toContain("didn&#x27;t request this email")
	})

	it("should handle different login links", () => {
		const links = [
			"https://app.jigjoy.ai/login?token=abc123",
			"http://localhost:3001/workspace?token=xyz",
			"https://dev-spektrum.jigjoy.ai/workspace?token=long-token-12345",
		]

		links.forEach((loginLink) => {
			const html = renderToStaticMarkup(
				React.createElement(MagicLinkEmail, { ...defaultProps, loginLink }),
			)
			expect(html).toContain(loginLink)
			expect(html).toContain(`href="${loginLink}"`)
		})
	})
})
