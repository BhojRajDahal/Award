import { render, screen } from "@testing-library/react"
import Home from "@/app/page"
import { I18nProvider } from "@/lib/i18n-context"

describe("Home Page", () => {
  it("renders the hero heading", () => {
    render(
      <I18nProvider>
        <Home />
      </I18nProvider>,
    )

    const heading = screen.getByText(/Nepal Academy of/i)
    expect(heading).toBeInTheDocument()
  })

  it("renders the prizes link", () => {
    render(
      <I18nProvider>
        <Home />
      </I18nProvider>,
    )

    const link = screen.getByRole("link", { name: /View Active Prizes/i })
    expect(link).toBeInTheDocument()
  })
})
