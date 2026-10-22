import { h } from 'vue'
import dataTableDropdown from '@/features/admin/custom-attributes/dataTableDropdown.vue'
import { Badge } from '@shared-ui/components/ui/badge'
import { Lock } from 'lucide-vue-next'
import TableDate from '@main/components/table/TableDate.vue'

export const createColumns = (t, { onEdit } = {}) => [
    {
        accessorKey: 'name',
        header: function () {
            return h('div', null, t('globals.terms.name'))
        },
        cell: function ({ row }) {
            return h('div', null,
                onEdit
                  ? h('span', {
                      class: 'text-foreground font-medium hover:underline cursor-pointer',
                      onClick: () => onEdit(row.original)
                    }, row.getValue('name'))
                  : row.getValue('name')
            )
        }
    },
    {
        accessorKey: 'key',
        header: function () {
            return h('div', null, t('globals.terms.key'))
        },
        cell: function ({ row }) {
            return h('div', null, row.getValue('key'))
        }
    },
    {
        accessorKey: 'data_type',
        meta: { compact: true },
        header: function () {
            return h('div', null, t('globals.terms.type'))
        },
        cell: function ({ row }) {
            return h('div', null, row.getValue('data_type'))
        }
    },
    {
        accessorKey: 'applies_to',
        meta: { compact: true },
        header: function () {
            return h('div', null, t('globals.terms.appliesTo'))
        },
        cell: function ({ row }) {
            return h('div', null, row.getValue('applies_to'))
        }
    },
    {
        accessorKey: 'read_only',
        meta: { compact: true },
        enableGlobalFilter: false,
        header: function () {
            return h('div', null, t('admin.customAttributes.managed'))
        },
        cell: function ({ row }) {
            if (!row.getValue('read_only')) return h('div', { class: 'text-muted-foreground' }, '-')
            return h('div', null, [
                h(
                    Badge,
                    {
                        variant: 'secondary',
                        class: 'text-xs gap-1',
                        title: t('admin.customAttributes.readOnly.label')
                    },
                    () => [h(Lock, { size: 12 }), t('admin.customAttributes.managed')]
                )
            ])
        }
    },
    {
        accessorKey: 'created_at',
        meta: { compact: true },
        enableGlobalFilter: false,
        header: function () {
            return h('div', null, t('globals.terms.createdAt'))
        },
        cell: function ({ row }) {
            return h(TableDate, { value: row.getValue('created_at') })
        }
    },
    {
        accessorKey: 'updated_at',
        meta: { compact: true },
        enableGlobalFilter: false,
        header: function () {
            return h('div', null, t('globals.terms.updatedAt'))
        },
        cell: function ({ row }) {
            return h(TableDate, { value: row.getValue('updated_at') })
        }
    },
    {
        id: 'actions',
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
            const customAttribute = row.original
            return h(
                'div',
                { class: 'relative' },
                h(dataTableDropdown, {
                    customAttribute
                })
            )
        }
    }
]
