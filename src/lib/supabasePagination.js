const DEFAULT_PAGE_SIZE = 1000;

export async function fetchAllRows({
  supabase,
  table,
  orderBy,
  ascending = true,
  pageSize = DEFAULT_PAGE_SIZE,
}) {
  const rows = [];
  let from = 0;

  while (true) {
    const result = await supabase
      .from(table)
      .select("*")
      .order(orderBy, { ascending })
      .range(from, from + pageSize - 1);

    if (result.error) {
      return {
        data: null,
        error: result.error,
      };
    }

    const page = result.data || [];
    rows.push(...page);

    if (page.length < pageSize) {
      return {
        data: rows,
        error: null,
      };
    }

    from += pageSize;
  }
}
