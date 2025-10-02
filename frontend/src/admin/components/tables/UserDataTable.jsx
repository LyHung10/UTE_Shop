// components/common/DataTableAntd.jsx
import React from "react";
import { Table, Space, Tooltip, Button } from "antd";
import {
    PencilIcon,
    TrashBinIcon,
    CheckLineIcon,
} from "@/admin/icons/index.js";
import { EyeIcon, Ban as BanIcon } from "lucide-react"; // 👈 thêm Ban/XCircle

export default function DataTable({
                                      columns = [],
                                      dataSource = [],
                                      rowKey = "id",
                                      loading = false,
                                      pagination = { pageSize: 10 },
                                      statusKey = "status",
                                      forceActions = null,
                                      onView,
                                      onConfirm,
                                      onCancel,
                                      onEdit,
                                      onDelete,
                                      onDisable,              // 👈 callback mới
                                      renderActions,
                                      scroll,
                                      size = "middle",
                                      actions = ["view", "edit", "delete", "confirm", "disable"], // 👈 thêm 'disable'
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

    const makeActions = (record) => {
        return (
            <Space size="small" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                {actions.includes("view") && (
                    <Btn
                        onClick={() => onView?.(record)}
                        className="text-gray-700 border-gray-200 hover:!bg-gray-100 dark:text-gray-200 dark:border-white/10 dark:hover:!bg-white/10"
                        icon={<EyeIcon className="size-4" />}
                    />
                )}

                {actions.includes("confirm") && (
                    <Btn
                        onClick={() => onConfirm?.(record)}
                        className="text-green-600 border-green-200 hover:!bg-green-50 dark:text-green-400 dark:border-green-900/40 dark:hover:!bg-green-900/20"
                        icon={<CheckLineIcon className="size-4" />}
                    />
                )}

                {actions.includes("cancel") && (
                    <Btn
                        onClick={() => onCancel?.(record)}
                        className="text-red-600 border-red-200 hover:!bg-red-50 dark:text-red-400 dark:border-red-900/40 dark:hover:!bg-red-900/20"
                        icon={<TrashBinIcon className="size-4" />}
                    />
                )}

                {actions.includes("edit") && (
                    <Btn
                        onClick={() => onEdit?.(record)}
                        className="text-blue-600 border-blue-200 hover:!bg-blue-50 dark:text-blue-400 dark:border-blue-900/40 dark:hover:!bg-blue-900/20"
                        icon={<PencilIcon className="size-4" />}
                    />
                )}

                {actions.includes("delete") && (
                    <Btn
                        onClick={() => onDelete?.(record)}
                        className="text-red-600 border-red-200 hover:!bg-red-50 dark:text-red-400 dark:border-red-900/40 dark:hover:!bg-red-900/20"
                        icon={<TrashBinIcon className="size-4" />}
                    />
                )}

                {/* 👇 Action vô hiệu hoá */}
                {actions.includes("disable") && (
                    <Btn
                        onClick={() => onDisable?.(record)}
                        className="text-amber-600 border-amber-200 hover:!bg-amber-50 dark:text-amber-400 dark:border-amber-900/40 dark:hover:!bg-amber-900/20"
                        icon={<BanIcon className="size-4" />}
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
        width: 140,
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
