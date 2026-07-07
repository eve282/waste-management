import { Link } from "react-router-dom";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyRow } from "../ui/Table";
import Badge from "../ui/Badge";
import Pagination from "../ui/Pagination";
import { Select } from "../ui/Field";
import usePagination from "../../hooks/usePagination";
import { STATUS_META, PRIORITY_META, formatLabel } from "../../utils/status";

const ViewIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

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
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onAssignClick(c)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Assign worker
                    </button>
                    <Link
                      to={`/complaints/${c._id}`}
                      title="View complaint report"
                      className="rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50"
                    >
                      <ViewIcon className="h-4 w-4" />
                    </Link>
                  </div>
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
