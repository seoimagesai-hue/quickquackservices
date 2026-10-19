export function AdminTable(props: {
  columns: string[];
  rows: React.ReactNode[][];
  empty?: string;
}) {
  if (!props.rows.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {props.empty ?? "No records."}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            {props.columns.map((c) => (
              <th key={c} className="px-3 py-2 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((cells, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {cells.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
