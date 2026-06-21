import { describe, expect, test, vi } from "vitest";
import { fetchAllRows } from "../lib/supabasePagination";

function createQueryBuilder(pages) {
  const range = vi.fn((from, to) => {
    const pageIndex = Math.floor(from / 1000);
    const page = pages[pageIndex] || [];
    return Promise.resolve({ data: page, error: null });
  });
  const order = vi.fn(() => ({ range }));
  const select = vi.fn(() => ({ order }));
  const from = vi.fn(() => ({ select }));

  return {
    client: { from },
    from,
    select,
    order,
    range,
  };
}

describe("fetchAllRows", () => {
  test("keeps paginating until a short page is returned", async () => {
    const firstPage = Array.from({ length: 1000 }, (_, index) => ({ id: `p${index}` }));
    const secondPage = Array.from({ length: 43 }, (_, index) => ({ id: `q${index}` }));
    const builder = createQueryBuilder([firstPage, secondPage]);

    const result = await fetchAllRows({
      supabase: builder.client,
      table: "predictions",
      orderBy: "submitted_at",
      ascending: true,
    });

    expect(builder.from).toHaveBeenCalledWith("predictions");
    expect(builder.range).toHaveBeenNthCalledWith(1, 0, 999);
    expect(builder.range).toHaveBeenNthCalledWith(2, 1000, 1999);
    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1043);
  });

  test("returns the first error without swallowing it", async () => {
    const range = vi.fn().mockResolvedValue({ data: null, error: { code: "boom", message: "boom" } });
    const order = vi.fn(() => ({ range }));
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));

    const result = await fetchAllRows({
      supabase: { from },
      table: "predictions",
      orderBy: "submitted_at",
      ascending: true,
    });

    expect(result).toEqual({
      data: null,
      error: { code: "boom", message: "boom" },
    });
  });
});
