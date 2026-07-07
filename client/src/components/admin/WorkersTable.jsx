import { Table, Thead, Tbody, Tr, Th, Td, EmptyRow } from "../ui/Table";
import Badge from "../ui/Badge";
import Pagination from "../ui/Pagination";
import usePagination from "../../hooks/usePagination";

const WorkersTable = ({ workers, onEdit, onToggleActive, onDelete }) => {
  const { page, setPage, pageItems, total, pageSize } = usePagination(workers, 8);

  return (
    <div className="space-y-2">
      <Table>
        <Thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Phone</Th>
            <Th>Zone</Th>
            <Th>Active tasks</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </Thead>
        <Tbody>
          {pageItems.length === 0 && <EmptyRow colSpan={7}>No workers added yet.</EmptyRow>}
          {pageItems.map((w) => (
            <Tr key={w._id} className={w.isActive ? "" : "opacity-60"}>
              <Td className="font-medium text-slate-800">{w.name}</Td>
              <Td>{w.userId?.email || "—"}</Td>
              <Td>{w.phone}</Td>
              <Td>{w.zoneAssigned}</Td>
              <Td>
                <Badge tone={w.activeTaskCount > 0 ? "blue" : "gray"}>{w.activeTaskCount} active</Badge>
              </Td>
              <Td>
                <Badge tone={w.isActive ? "green" : "gray"}>{w.isActive ? "Active" : "Deactivated"}</Badge>
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(w)}
                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onToggleActive(w)}
                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {w.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => onDelete(w)}
                    className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  );
};

export default WorkersTable;
