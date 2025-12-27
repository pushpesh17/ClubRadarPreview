import { render, screen } from "@testing-library/react";
import VenueLayout from "@/app/venue/layout";

describe("VenueLayout", () => {
  it("renders children correctly", () => {
    render(
      <VenueLayout>
        <div>Test Content</div>
      </VenueLayout>
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <VenueLayout>
        <div>First Child</div>
        <div>Second Child</div>
      </VenueLayout>
    );
    expect(screen.getByText("First Child")).toBeInTheDocument();
    expect(screen.getByText("Second Child")).toBeInTheDocument();
  });

  it("renders without children", () => {
    const { container } = render(<VenueLayout>{null}</VenueLayout>);
    // Fragment renders even with null children
    expect(container).toBeTruthy();
  });
});
