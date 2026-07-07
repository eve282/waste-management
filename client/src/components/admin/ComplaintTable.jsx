import { Table, Thead, Tbody, Tr, Th, Td, EmptyRow } from "../ui/Table";
import Badge from "../ui/Badge";
import Pagination from "../ui/Pagination";
import { Select } from "../ui/Field";
import usePagination from "../../hooks/usePagination";
import { STATUS_META, PRIORITY_META, formatLabel } from "../../utils/status";

const statusOptions = ["pending", "assigned", "in_progress", "resolved"];

const ComplaintTable = ({ complaints, onAssignClick, onStatusChange, selectedId, onSelectComplaint }) => {
  const { page, setPage, pageItems, total, pageSize } = usePagination(complaints, 8);

  return (
    <div className="space-y-2">
      <Table>
        <Thead>
          <tr>
            <Th>Category</Th>
            <Th>Citizen</Th>
            <Th>Status</Th>
            <Th>Priority</Th>
            <Th>Worker</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </Thead>
        <Tbody>
          {pageItems.length === 0 && <EmptyRow colSpan={6}>No complaints match these filters.</EmptyRow>}
          {pageItems.map((c) => {
            const priorityMeta = PRIORITY_META[c.priority] || {};
            return (
              <Tr key={c._id} selected={c._id === selectedId} onClick={() => onSelectComplaint?.(c._id)}>
                <Td className="font-medium capitalize text-slate-800">{formatLabel(c.category)}</Td>
                <Td>{c.userId?.name || "—"}</Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={c.status}
                    onChange={(e) => onStatusChange(c._id, e.target.value)}
                    className="!w-auto py-1"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_META[s].label}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Badge tone={priorityMeta.tone}>{priorityMeta.label}</Badge>
                </Td>
                <Td>{c.assignedWorkerId?.name || "—"}</Td>
                <Td className="text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onAssignClick(c)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Assign worker
                  </button>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  );
};

export default ComplaintTable;
