// components/common/DataTableAntd.jsx
import React from "react";
import { Table, Space, Tooltip, Button } from "antd";
import {
    PencilIcon,     // edit (nếu cần sau này)
    TrashBinIcon,   // delete -> Cancel dùng icon thùng rác cho nhanh
    CheckLineIcon,  // confirm
} from "@/admin/icons/index.js";
import {EyeIcon, XCircle} from "lucide-react";

/**
 * Props:
 *  - columns, dataSource, rowKey, loading, pagination, scroll, size (như cũ)
 *  - statusKey?: string = "status"     // tên field trạng thái trong record
 *  - forceActions?: ('view'|'confirm'|'cancel'|'edit'|'delete')[] | null
 *      => nếu truyền thì sẽ dùng đúng list này, bỏ qua logic theo trạng thái
 *  - onView?(record), onConfirm?(record), onCancel?(record),
 *    onEdit?(record), onDelete?(record)  // (delete để dành nếu bạn muốn)
 *  - renderActions?(record)  // custom toàn bộ cụm actions
 */
export default function DataTable({
                                      columns = [],
                                      dataSource = [],
                                      rowKey = "id",
                                      loading = false,
                                      pagination = { pageSize: 20 },
                                      statusKey = "status",
                                      forceActions = null, // nếu set -> override mapping theo trạng thái
                                      onView,
                                      onConfirm,
                                      onCancel,
                                      onEdit,      // optional
                                      onDelete,    // optional
                                      renderActions,
                                      scroll,
                                      size = "middle",
                                  }) {
    const Btn = ({ title, onClick, className, icon }) => (
        <Tooltip title={title}>
            <Button
                type="default"
                size="small"
                onClick={onClick}
                className={`
          !p-0 size-8 rounded-full border
          ${className}
        `}
                icon={icon}
            />
        </Tooltip>
    );

    // Chuẩn hoá status (tránh typo/hoa thường)
    const normalizeStatus = (s) => String(s || "").trim().toLowerCase();

    // Mapping action theo trạng thái
    // new, packing -> view + confirm + cancel
    // shipping, completed, canceled -> view
    const getActionsByStatus = (record) => {
        if (Array.isArray(forceActions)) return forceActions;

        const st = normalizeStatus(record?.[statusKey]);
        if (st === "new" || st === "packing") {
            return ["view", "confirm", "cancel"];
        }
        // shipping / completed / canceled -> chỉ view
        return ["view"];
    };

    const makeActions = (record) => {
        const acts = getActionsByStatus(record);

        // Nếu bạn muốn “delete” action khác “cancel”, có thể thêm ở đây.
        return (
            <Space size="small" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                {acts.includes("view") && (
                    <Btn
                        onClick={() => onView?.(record)}
                        className="
              text-gray-700 border-gray-200 hover:!bg-gray-100
              dark:text-gray-200 dark:border-white/10 dark:hover:!bg-white/10
            "
                        icon={<EyeIcon className="size-4" />}
                    />
                )}

                {acts.includes("confirm") && (
                    <Btn
                        onClick={() => onConfirm?.(record)}
                        className="
              text-green-600 border-green-200 hover:!bg-green-50
              dark:text-green-400 dark:border-green-900/40 dark:hover:!bg-green-900/20
            "
                        icon={<CheckLineIcon className="size-4" />}
                    />
                )}

                {acts.includes("cancel") && (
                    <Btn
                        onClick={() => onCancel?.(record)}
                        className="
              text-red-600 border-red-200 hover:!bg-red-50
              dark:text-red-400 dark:border-red-900/40 dark:hover:!bg-red-900/20
            "
                        icon={<XCircle className="size-4" />}
                    />
                )}

                {/* Nếu sau này cần edit/delete thuần: */}
                {acts.includes("edit") && (
                    <Btn
                        onClick={() => onEdit?.(record)}
                        className="
              text-blue-600 border-blue-200 hover:!bg-blue-50
              dark:text-blue-400 dark:border-blue-900/40 dark:hover:!bg-blue-900/20
            "
                        icon={<PencilIcon className="size-4" />}
                    />
                )}
                {acts.includes("delete") && (
                    <Btn
                        onClick={() => onDelete?.(record)}
                        className="
              text-red-600 border-red-200 hover:!bg-red-50
              dark:text-red-400 dark:border-red-900/40 dark:hover:!bg-red-900/20
            "
                        icon={<TrashBinIcon className="size-4" />}
                    />
                )}
            </Space>
        );
    };

    const actionCol = {
        title: "Actions",
        key: "_actions",
        dataIndex: "_actions",
        fixed: "right",
        width: 180,
        align: "center",
        render: (_, record) =>
            typeof renderActions === "function" ? renderActions(record) : makeActions(record),
    };

    const mergedCols = [...columns, actionCol];

    return (
        <Table
            size={size}
            columns={mergedCols}
            dataSource={dataSource}
            rowKey={rowKey}
            loading={loading}
            pagination={pagination}
            scroll={scroll}
            className="
        rounded-2xl border border-gray-200 dark:border-white/10
        bg-white dark:bg-[#1a1a1a]
        [&_.ant-table-thead_th]:!bg-gray-50 dark:[&_.ant-table-thead_th]:!bg-gray-800
        [&_.ant-table-cell]:!text-gray-700 dark:[&_.ant-table-cell]:!text-gray-200
      "
        />
    );
}
