import { render } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("../../services/geminiService", () => ({
  generateRelics: vi.fn(),
}));

describe("App", () => {
  it("renders the App component", async () => {
    const { default: App } = await import("../../App");
    render(<App />);
  });
});
