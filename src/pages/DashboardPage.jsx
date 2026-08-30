import { useAuth0 } from '@auth0/auth0-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import httpClient from '../api/httpClient'
import PageContainer from '../components/common/PageContainer'
import SectionCard from '../components/common/SectionCard'

const tablesEndpoint = '/sysout-api/rds/table'
const tablesMode = (import.meta.env.VITE_TABLES_MODE ?? 'mock').trim().toLowerCase()
const auth0Audience = (import.meta.env.VITE_AUTH0_AUDIENCE ?? '').trim()
const mockTableResponse = {
  schemas: [
    {
      schema: 'shopping_cart',
      tables: [
        {
          tableName: 'customers',
          columns: ['id', 'first_name', 'last_name', 'email', 'phone', 'created_at'],
          primaryKey: ['id'],
          sampleRows: [
            { id: 1, first_name: 'Aarav', last_name: 'Sharma', email: 'aarav.sharma@example.com', phone: '+1-555-0101', created_at: '2026-08-01T09:15:00Z' },
            { id: 2, first_name: 'Diya', last_name: 'Patel', email: 'diya.patel@example.com', phone: '+1-555-0102', created_at: '2026-08-02T11:05:00Z' },
            { id: 3, first_name: 'Rohan', last_name: 'Mehta', email: 'rohan.mehta@example.com', phone: '+1-555-0103', created_at: '2026-08-03T13:20:00Z' },
            { id: 4, first_name: 'Anika', last_name: 'Verma', email: 'anika.verma@example.com', phone: '+1-555-0104', created_at: '2026-08-04T15:10:00Z' },
            { id: 5, first_name: 'Kabir', last_name: 'Iyer', email: 'kabir.iyer@example.com', phone: '+1-555-0105', created_at: '2026-08-05T18:45:00Z' },
          ],
        },
        {
          tableName: 'products',
          columns: ['id', 'name', 'sku', 'price', 'stock_quantity', 'category_id'],
          primaryKey: ['id'],
          foreignKeys: [{ column: 'category_id', references: 'categories.id' }],
          sampleRows: [
            { id: 101, name: 'Wireless Mouse', sku: 'WM-1001', price: '24.99', stock_quantity: 48, category_id: 10 },
            { id: 102, name: 'Mechanical Keyboard', sku: 'MK-1002', price: '79.99', stock_quantity: 31, category_id: 10 },
            { id: 103, name: 'Noise Cancelling Headphones', sku: 'NH-1003', price: '129.99', stock_quantity: 17, category_id: 10 },
            { id: 104, name: 'Coffee Mug', sku: 'CM-1004', price: '12.50', stock_quantity: 90, category_id: 12 },
            { id: 105, name: 'Desk Lamp', sku: 'DL-1005', price: '34.95', stock_quantity: 26, category_id: 13 },
          ],
        },
        {
          tableName: 'categories',
          columns: ['id', 'name', 'slug', 'parent_id'],
          primaryKey: ['id'],
          foreignKeys: [{ column: 'parent_id', references: 'categories.id' }],
          sampleRows: [
            { id: 10, name: 'Electronics', slug: 'electronics', parent_id: null },
            { id: 11, name: 'Accessories', slug: 'accessories', parent_id: 10 },
            { id: 12, name: 'Home & Kitchen', slug: 'home-kitchen', parent_id: null },
            { id: 13, name: 'Lighting', slug: 'lighting', parent_id: 12 },
            { id: 14, name: 'Office', slug: 'office', parent_id: null },
          ],
        },
        {
          tableName: 'carts',
          columns: ['id', 'customer_id', 'status', 'created_at', 'updated_at'],
          primaryKey: ['id'],
          foreignKeys: [{ column: 'customer_id', references: 'customers.id' }],
          sampleRows: [
            { id: 1001, customer_id: 1, status: 'active', created_at: '2026-08-06T08:30:00Z', updated_at: '2026-08-06T09:00:00Z' },
            { id: 1002, customer_id: 2, status: 'checked_out', created_at: '2026-08-06T10:15:00Z', updated_at: '2026-08-06T10:45:00Z' },
            { id: 1003, customer_id: 3, status: 'active', created_at: '2026-08-07T12:00:00Z', updated_at: '2026-08-07T12:20:00Z' },
            { id: 1004, customer_id: 4, status: 'abandoned', created_at: '2026-08-08T14:10:00Z', updated_at: '2026-08-08T16:00:00Z' },
            { id: 1005, customer_id: 5, status: 'active', created_at: '2026-08-09T17:25:00Z', updated_at: '2026-08-09T17:40:00Z' },
          ],
        },
        {
          tableName: 'cart_items',
          columns: ['id', 'cart_id', 'product_id', 'quantity', 'unit_price'],
          primaryKey: ['id'],
          foreignKeys: [
            { column: 'cart_id', references: 'carts.id' },
            { column: 'product_id', references: 'products.id' },
          ],
          sampleRows: [
            { id: 2001, cart_id: 1001, product_id: 101, quantity: 1, unit_price: '24.99' },
            { id: 2002, cart_id: 1001, product_id: 102, quantity: 1, unit_price: '79.99' },
            { id: 2003, cart_id: 1002, product_id: 103, quantity: 2, unit_price: '129.99' },
            { id: 2004, cart_id: 1003, product_id: 104, quantity: 3, unit_price: '12.50' },
            { id: 2005, cart_id: 1005, product_id: 105, quantity: 1, unit_price: '34.95' },
          ],
        },
        {
          tableName: 'orders',
          columns: ['id', 'customer_id', 'order_number', 'status', 'total_amount', 'created_at'],
          primaryKey: ['id'],
          foreignKeys: [{ column: 'customer_id', references: 'customers.id' }],
          sampleRows: [
            { id: 3001, customer_id: 2, order_number: 'ORD-2026-0801', status: 'paid', total_amount: '104.98', created_at: '2026-08-06T10:50:00Z' },
            { id: 3002, customer_id: 3, order_number: 'ORD-2026-0802', status: 'processing', total_amount: '259.98', created_at: '2026-08-07T12:30:00Z' },
            { id: 3003, customer_id: 1, order_number: 'ORD-2026-0803', status: 'shipped', total_amount: '34.95', created_at: '2026-08-08T15:10:00Z' },
            { id: 3004, customer_id: 5, order_number: 'ORD-2026-0804', status: 'paid', total_amount: '129.99', created_at: '2026-08-09T18:00:00Z' },
            { id: 3005, customer_id: 4, order_number: 'ORD-2026-0805', status: 'cancelled', total_amount: '12.50', created_at: '2026-08-10T09:45:00Z' },
          ],
        },
        {
          tableName: 'order_items',
          columns: ['id', 'order_id', 'product_id', 'quantity', 'unit_price', 'line_total'],
          primaryKey: ['id'],
          foreignKeys: [
            { column: 'order_id', references: 'orders.id' },
            { column: 'product_id', references: 'products.id' },
          ],
          sampleRows: [
            { id: 4001, order_id: 3001, product_id: 101, quantity: 1, unit_price: '24.99', line_total: '24.99' },
            { id: 4002, order_id: 3001, product_id: 102, quantity: 1, unit_price: '79.99', line_total: '79.99' },
            { id: 4003, order_id: 3002, product_id: 103, quantity: 2, unit_price: '129.99', line_total: '259.98' },
            { id: 4004, order_id: 3003, product_id: 105, quantity: 1, unit_price: '34.95', line_total: '34.95' },
            { id: 4005, order_id: 3004, product_id: 104, quantity: 1, unit_price: '12.50', line_total: '12.50' },
          ],
        },
        {
          tableName: 'payments',
          columns: ['id', 'order_id', 'payment_method', 'amount', 'status', 'paid_at'],
          primaryKey: ['id'],
          foreignKeys: [{ column: 'order_id', references: 'orders.id' }],
          sampleRows: [
            { id: 5001, order_id: 3001, payment_method: 'card', amount: '104.98', status: 'paid', paid_at: '2026-08-06T10:52:00Z' },
            { id: 5002, order_id: 3002, payment_method: 'upi', amount: '259.98', status: 'paid', paid_at: '2026-08-07T12:34:00Z' },
            { id: 5003, order_id: 3003, payment_method: 'card', amount: '34.95', status: 'paid', paid_at: '2026-08-08T15:12:00Z' },
            { id: 5004, order_id: 3004, payment_method: 'netbanking', amount: '129.99', status: 'pending', paid_at: null },
            { id: 5005, order_id: 3005, payment_method: 'card', amount: '12.50', status: 'refunded', paid_at: '2026-08-10T10:00:00Z' },
          ],
        },
        {
          tableName: 'shipments',
          columns: ['id', 'order_id', 'carrier', 'tracking_number', 'status', 'shipped_at'],
          primaryKey: ['id'],
          foreignKeys: [{ column: 'order_id', references: 'orders.id' }],
          sampleRows: [
            { id: 6001, order_id: 3001, carrier: 'Delhivery', tracking_number: 'DLV-3001-01', status: 'delivered', shipped_at: '2026-08-07T08:00:00Z' },
            { id: 6002, order_id: 3002, carrier: 'Blue Dart', tracking_number: 'BD-3002-01', status: 'in_transit', shipped_at: '2026-08-08T09:20:00Z' },
            { id: 6003, order_id: 3003, carrier: 'Ekart', tracking_number: 'EK-3003-01', status: 'delivered', shipped_at: '2026-08-09T11:15:00Z' },
            { id: 6004, order_id: 3004, carrier: 'DHL', tracking_number: 'DHL-3004-01', status: 'label_created', shipped_at: null },
            { id: 6005, order_id: 3005, carrier: 'FedEx', tracking_number: 'FDX-3005-01', status: 'returned', shipped_at: '2026-08-10T12:30:00Z' },
          ],
        },
        {
          tableName: 'discount_codes',
          columns: ['id', 'code', 'discount_type', 'discount_value', 'expires_at', 'active'],
          primaryKey: ['id'],
          sampleRows: [
            { id: 7001, code: 'SAVE10', discount_type: 'percent', discount_value: '10', expires_at: '2026-12-31T23:59:59Z', active: true },
            { id: 7002, code: 'WELCOME50', discount_type: 'flat', discount_value: '50', expires_at: '2026-10-31T23:59:59Z', active: true },
            { id: 7003, code: 'FESTIVE15', discount_type: 'percent', discount_value: '15', expires_at: '2026-09-30T23:59:59Z', active: true },
            { id: 7004, code: 'CLEARANCE25', discount_type: 'percent', discount_value: '25', expires_at: '2026-08-31T23:59:59Z', active: false },
            { id: 7005, code: 'FREESHIP', discount_type: 'flat', discount_value: '0', expires_at: '2026-11-30T23:59:59Z', active: true },
          ],
        },
      ],
    },
  ],
}

function normalizeTableName(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim()
  }

  if (value && typeof value === 'object') {
    return (
      value.tableName ??
      value.table_name ??
      value.table ??
      value.name ??
      value.value ??
      ''
    )
      .toString()
      .trim()
  }

  return ''
}

function normalizeColumnList(value) {
  const rawColumns = Array.isArray(value) ? value : value ? [value] : []

  return [...new Set(rawColumns.map(normalizeTableName).filter(Boolean))]
}

function normalizeKeyList(value) {
  const rawKeys = Array.isArray(value) ? value : value ? [value] : []

  return [...new Set(rawKeys.map(normalizeTableName).filter(Boolean))]
}

function normalizeForeignKeyList(value) {
  const rawForeignKeys = Array.isArray(value) ? value : value ? [value] : []

  return rawForeignKeys
    .map((foreignKey) => {
      if (typeof foreignKey === 'string') {
        const [column, references] = foreignKey.split('->').map((part) => part.trim())
        return column && references ? { column, references } : null
      }

      if (!foreignKey || typeof foreignKey !== 'object') {
        return null
      }

      const column = (
        foreignKey.column ??
        foreignKey.columnName ??
        foreignKey.name ??
        foreignKey.key ??
        ''
      )
        .toString()
        .trim()

      const references = (
        foreignKey.references ??
        foreignKey.reference ??
        foreignKey.ref ??
        foreignKey.target ??
        ''
      )
        .toString()
        .trim()

      if (!column || !references) {
        return null
      }

      return { column, references }
    })
    .filter(Boolean)
}

function getReferencedTableName(references) {
  const parsed = parseForeignKeyReference(references)
  return parsed.tableName
}

function parseForeignKeyReference(references) {
  if (!references) {
    return { schemaName: '', tableName: '', columnName: '' }
  }

  const parts = references
    .toString()
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length >= 3) {
    const [schemaName, tableName, ...rest] = parts
    return { schemaName, tableName, columnName: rest.join('.') }
  }

  if (parts.length === 2) {
    const [tableName, columnName] = parts
    return { schemaName: '', tableName, columnName }
  }

  return { schemaName: '', tableName: parts[0] ?? '', columnName: '' }
}

function resolveReferencedTableLocation(schemas, fallbackSchemaName, references) {
  const parsedReference = parseForeignKeyReference(references)
  const targetTableName = parsedReference.tableName
  if (!targetTableName) {
    return null
  }

  const preferredSchema =
    schemas.find(
      (schema) =>
        (parsedReference.schemaName ? schema.schemaName === parsedReference.schemaName : schema.schemaName === fallbackSchemaName) &&
        schema.tables.some((table) => table.tableName === targetTableName)
    ) ?? null

  const anyMatchingSchema =
    schemas.find((schema) => schema.tables.some((table) => table.tableName === targetTableName)) ??
    null

  const targetSchema = preferredSchema ?? anyMatchingSchema
  const targetTable = targetSchema?.tables?.find((table) => table.tableName === targetTableName)

  if (!targetSchema || !targetTable) {
    return null
  }

  return { schemaName: targetSchema.schemaName, table: targetTable }
}

function createTableKey(schemaName, tableName) {
  return `${schemaName}.${tableName}`
}

function createVirtualAnchor(element) {
  const rect = element.getBoundingClientRect()

  return {
    contextElement: element,
    getBoundingClientRect: () => rect,
  }
}

function getRowIdentityValue(table, row, rowIndex) {
  const primaryKey = table.primaryKey?.[0]
  if (primaryKey && row && Object.prototype.hasOwnProperty.call(row, primaryKey)) {
    const value = row[primaryKey]
    if (value !== undefined && value !== null) {
      return value
    }
  }

  return rowIndex
}

function resolveRowTarget(table, target) {
  if (!table || !target) {
    return { index: null, row: null }
  }

  if (
    target.schemaName !== table.schemaName ||
    target.tableName !== table.tableName ||
    target.keyValue === undefined
  ) {
    return { index: null, row: null }
  }

  const primaryKey = table.primaryKey?.[0]
  if (primaryKey) {
    const index = table.sampleRows.findIndex(
      (row) => String(row?.[primaryKey] ?? '') === String(target.keyValue ?? '')
    )

    if (index >= 0) {
      return { index, row: table.sampleRows[index] }
    }
  }

  if (typeof target.keyValue === 'number' && table.sampleRows[target.keyValue]) {
    return { index: target.keyValue, row: table.sampleRows[target.keyValue] }
  }

  return { index: null, row: null }
}

function tableMatchesSearch(schemaName, table, query) {
  if (!query) {
    return true
  }

  const haystack = [
    schemaName,
    table.tableName,
    ...(table.columns ?? []),
    ...(table.primaryKey ?? []),
    ...(table.foreignKeys ?? []).flatMap((fk) => [fk.column, fk.references]),
    ...((table.sampleRows ?? []).flatMap((row) => Object.values(row ?? {}))),
  ]
    .filter((value) => value !== null && value !== undefined)
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

function getInboundUsageSummary(schemas, schemaName, tableName) {
  const summary = {
    schemaName,
    tableName,
    pkCount: 0,
    fkCount: 0,
    inboundCount: 0,
    inboundSources: [],
  }

  schemas.forEach((schema) => {
    schema.tables.forEach((table) => {
      if (schema.schemaName === schemaName && table.tableName === tableName) {
        summary.pkCount = table.primaryKey?.length ?? 0
        summary.fkCount = table.foreignKeys?.length ?? 0
      }

      ;(table.foreignKeys ?? []).forEach((foreignKey) => {
        const resolvedTable = resolveReferencedTableLocation(
          schemas,
          schema.schemaName,
          foreignKey.references
        )

        if (
          resolvedTable?.schemaName === schemaName &&
          resolvedTable.table.tableName === tableName
        ) {
          summary.inboundCount += 1
          summary.inboundSources.push({
            schemaName: schema.schemaName,
            tableName: table.tableName,
            columnName: foreignKey.column,
          })
        }
      })
    })
  })

  return summary
}

function removeForeignKeyUsageFromSchemas(schemas, sourceSchemaName, sourceTableName, sourceColumnName) {
  return schemas.map((schema) => {
    if (schema.schemaName !== sourceSchemaName) {
      return schema
    }

    return {
      ...schema,
      tables: schema.tables.map((table) => {
        if (table.tableName !== sourceTableName) {
          return table
        }

        return {
          ...table,
          foreignKeys: (table.foreignKeys ?? []).filter((foreignKey) => foreignKey.column !== sourceColumnName),
        }
      }),
    }
  })
}

function getColumnRole(table, columnName) {
  if (table.primaryKey?.includes(columnName)) {
    return 'pk'
  }

  if (table.foreignKeys?.some((key) => key.column === columnName)) {
    return 'fk'
  }

  return 'general'
}

function getReferencedRowPreview(schemas, schemaName, references, value) {
  const resolvedTable = resolveReferencedTableLocation(schemas, schemaName, references)
  if (!resolvedTable) {
    return null
  }

  const primaryKey = resolvedTable.table.primaryKey?.[0] ?? 'id'
  const matchedRow =
    resolvedTable.table.sampleRows?.find(
      (row) => String(row?.[primaryKey] ?? '') === String(value ?? '')
    ) ?? null

  return {
    schemaName: resolvedTable.schemaName,
    tableName: resolvedTable.table.tableName,
    primaryKey,
    foreignKeys: resolvedTable.table.foreignKeys ?? [],
    row: matchedRow,
    columns: resolvedTable.table.columns ?? [],
  }
}

function formatSampleValue(tableName, columnName, rowIndex) {
  const key = columnName.toLowerCase()

  if (key === 'id' || key.endsWith('_id')) {
    return rowIndex
  }

  if (key.includes('email')) {
    return `${tableName}${rowIndex}@example.com`
  }

  if (key.includes('phone')) {
    return `+1-555-010${rowIndex}`
  }

  if (key.includes('price') || key.includes('amount') || key.includes('total') || key.includes('value')) {
    return (rowIndex * 19.95).toFixed(2)
  }

  if (key.includes('quantity') || key.includes('stock')) {
    return rowIndex * 3
  }

  if (key.endsWith('_at') || key.includes('date')) {
    const day = String(rowIndex).padStart(2, '0')
    return `2026-08-${day}T10:00:00Z`
  }

  if (key.includes('status')) {
    return ['active', 'pending', 'processing', 'shipped', 'paid'][rowIndex - 1] ?? 'active'
  }

  if (key.includes('code') || key.includes('sku') || key.includes('slug') || key.includes('number')) {
    return `${tableName}-${columnName}-${rowIndex}`
  }

  return `${tableName}-${columnName}-${rowIndex}`
}

function buildSampleRows(tableName, columns) {
  return Array.from({ length: 5 }, (_, index) => {
    const rowNumber = index + 1
    return columns.reduce((row, columnName) => {
      row[columnName] = formatSampleValue(tableName, columnName, rowNumber)
      return row
    }, {})
  })
}

function addForeignKeyLinkToSchemas(
  schemas,
  sourceSchemaName,
  sourceTableName,
  targetSchemaName,
  targetTableName
) {
  return schemas.map((schema) => {
    if (schema.schemaName !== sourceSchemaName && schema.schemaName !== targetSchemaName) {
      return schema
    }

    return {
      ...schema,
      tables: schema.tables.map((table) => {
        if (schema.schemaName === targetSchemaName && table.tableName === targetTableName) {
          return table
        }

        if (schema.schemaName !== sourceSchemaName || table.tableName !== sourceTableName) {
          return table
        }

        const targetTable = schemas
          .find((item) => item.schemaName === targetSchemaName)
          ?.tables?.find((item) => item.tableName === targetTableName)

        if (!targetTable) {
          return table
        }

        const targetPrimaryKey = targetTable.primaryKey?.[0] ?? 'id'
        const fkColumnCandidates = [
          `${targetTableName}_id`,
          `${targetTableName.slice(0, -1)}_id`,
        ]
        const fkColumn =
          table.columns.find((columnName) => fkColumnCandidates.includes(columnName)) ??
          fkColumnCandidates[0]
        const foreignKeyReference = `${targetSchemaName}.${targetTableName}.${targetPrimaryKey}`
        const existingForeignKey = (table.foreignKeys ?? []).some(
          (foreignKey) =>
            foreignKey.column === fkColumn && foreignKey.references === foreignKeyReference
        )
        const nextColumns = table.columns.includes(fkColumn)
          ? table.columns
          : [...table.columns, fkColumn]
        const targetValues = targetTable.sampleRows?.map((row) => row?.[targetPrimaryKey]).filter(
          (value) => value !== undefined && value !== null
        )

        return {
          ...table,
          columns: nextColumns,
          foreignKeys: existingForeignKey
            ? table.foreignKeys
            : [
                ...(table.foreignKeys ?? []),
                { column: fkColumn, references: foreignKeyReference },
              ],
          sampleRows: (table.sampleRows ?? []).map((row, rowIndex) => {
            if (row[fkColumn] !== undefined && row[fkColumn] !== null) {
              return row
            }

            const nextValue =
              targetValues.length > 0 ? targetValues[rowIndex % targetValues.length] : rowIndex + 1

            return {
              ...row,
              [fkColumn]: nextValue,
            }
          }),
        }
      }),
    }
  })
}

function normalizeTableEntry(entry, fallbackIndex) {
  if (typeof entry === 'string' || typeof entry === 'number') {
    return {
      tableName: String(entry).trim(),
      columns: [],
      primaryKey: [],
      foreignKeys: [],
    }
  }

  if (!entry || typeof entry !== 'object') {
    return null
  }

  const tableName = (
    entry.tableName ??
    entry.table_name ??
    entry.table ??
    entry.name ??
    entry.value ??
    `table-${fallbackIndex + 1}`
  )
    .toString()
    .trim()

  const columns = normalizeColumnList(
    entry.columns ??
      entry.columnNames ??
      entry.column_names ??
      entry.fields ??
      entry.items ??
      entry.rows ??
      []
  )
  const primaryKey = normalizeKeyList(
    entry.primaryKey ?? entry.primaryKeys ?? entry.pk ?? entry.primary_key ?? entry.primary_keys
  )
  const foreignKeys = normalizeForeignKeyList(
    entry.foreignKeys ?? entry.foreignKey ?? entry.fk ?? entry.foreign_keys ?? entry.foreign_key
  )
  const sampleRows = Array.isArray(entry.sampleRows)
    ? entry.sampleRows
    : Array.isArray(entry.rows)
      ? entry.rows
      : buildSampleRows(tableName || `table-${fallbackIndex + 1}`, columns)

  return {
    tableName: tableName || `table-${fallbackIndex + 1}`,
    columns,
    primaryKey,
    foreignKeys,
    sampleRows,
  }
}

function normalizeSchemaEntry(entry, fallbackIndex) {
  if (!entry || typeof entry !== 'object') {
    return null
  }

  const schemaName = (
    entry.schema ??
    entry.schemaName ??
    entry.schema_name ??
    entry.namespace ??
    entry.name ??
    `schema-${fallbackIndex + 1}`
  )
    .toString()
    .trim()

  const rawTables =
    entry.tables ??
    entry.tableNames ??
    entry.table_names ??
    entry.tableList ??
    entry.items ??
    entry.rows ??
    []

  const tables = []
  const tableMap = new Map()
  const tableEntries = Array.isArray(rawTables) ? rawTables : [rawTables]

  tableEntries
    .map(normalizeTableEntry)
    .filter(Boolean)
    .forEach((table, index) => {
      const existing = tableMap.get(table.tableName)
      if (existing) {
        existing.columns = [...new Set([...existing.columns, ...table.columns])]
        return
      }

      tableMap.set(table.tableName, {
        tableName: table.tableName || `table-${index + 1}`,
        columns: table.columns,
        primaryKey: table.primaryKey,
        foreignKeys: table.foreignKeys,
        sampleRows: table.sampleRows,
      })
    })

  tableMap.forEach((table) => {
    tables.push(table)
  })

  return {
    schemaName: schemaName || `schema-${fallbackIndex + 1}`,
    tables,
  }
}

function normalizeTableInventory(data) {
  if (Array.isArray(data)) {
    return data.map(normalizeSchemaEntry).filter(Boolean)
  }

  if (!data || typeof data !== 'object') {
    return []
  }

  if (Array.isArray(data.schemas)) {
    return data.schemas.map(normalizeSchemaEntry).filter(Boolean)
  }

  if (Array.isArray(data.data)) {
    return data.data.map(normalizeSchemaEntry).filter(Boolean)
  }

  if (Array.isArray(data.result)) {
    return data.result.map(normalizeSchemaEntry).filter(Boolean)
  }

  if (Array.isArray(data.items)) {
    return data.items.map(normalizeSchemaEntry).filter(Boolean)
  }

  const hasExplicitSchemaShape =
    Object.prototype.hasOwnProperty.call(data, 'schema') ||
    Object.prototype.hasOwnProperty.call(data, 'schemaName') ||
    Object.prototype.hasOwnProperty.call(data, 'schema_name') ||
    Object.prototype.hasOwnProperty.call(data, 'tables') ||
    Object.prototype.hasOwnProperty.call(data, 'tableNames') ||
    Object.prototype.hasOwnProperty.call(data, 'table_names') ||
    Object.prototype.hasOwnProperty.call(data, 'tableList')

  if (hasExplicitSchemaShape) {
    return [normalizeSchemaEntry(data, 0)].filter(Boolean)
  }

  return Object.entries(data)
    .map(([schemaName, tables], index) =>
      normalizeSchemaEntry({ schema: schemaName, tables }, index)
    )
    .filter(Boolean)
}

function DashboardPage() {
  const theme = useTheme()
  const { user, getAccessTokenSilently } = useAuth0()
  const [schemas, setSchemas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [modeLabel, setModeLabel] = useState('mock')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTableKey, setActiveTableKey] = useState('')
  const [selectedSampleRowTarget, setSelectedSampleRowTarget] = useState(null)
  const [compareSampleRowTarget, setCompareSampleRowTarget] = useState(null)
  const [navigationTrail, setNavigationTrail] = useState([])
  const [hoverTableKey, setHoverTableKey] = useState('')
  const [hoverAnchorEl, setHoverAnchorEl] = useState(null)
  const [inboundUsagePreview, setInboundUsagePreview] = useState(null)
  const [dragSourceTableKey, setDragSourceTableKey] = useState('')
  const [dropTargetTableKey, setDropTargetTableKey] = useState('')
  const hoverCloseTimerRef = useRef(null)
  const inboundUsageCloseTimerRef = useRef(null)
  const [fkHoverPreview, setFkHoverPreview] = useState(null)
  const fkHoverCloseTimerRef = useRef(null)

  const isTableExpanded = useCallback(
    (schemaName, tableName) => activeTableKey === `${schemaName}.${tableName}`,
    [activeTableKey]
  )

  const toggleTable = useCallback(
    (schemaName, tableName) => {
      const tableKey = `${schemaName}.${tableName}`
      const nextActiveTableKey = activeTableKey === tableKey ? '' : tableKey

      setActiveTableKey(nextActiveTableKey)
      setSelectedSampleRowTarget(null)
      setCompareSampleRowTarget(null)
      setNavigationTrail(
        nextActiveTableKey ? [{ schemaName, tableName, keyValue: null }] : []
      )
    },
    [activeTableKey]
  )

  const updateTrailForTable = useCallback((schemaName, tableName, keyValue = null) => {
    setNavigationTrail((current) => {
      const entry = { schemaName, tableName, keyValue }
      const last = current[current.length - 1]

      if (last && last.schemaName === schemaName && last.tableName === tableName) {
        return [...current.slice(0, -1), entry]
      }

      return [...current, entry]
    })
  }, [])

  const navigateBreadcrumb = useCallback((index, schemaName, tableName, keyValue) => {
    setActiveTableKey(`${schemaName}.${tableName}`)
    setSelectedSampleRowTarget(
      keyValue !== null && keyValue !== undefined
        ? { schemaName, tableName, keyValue }
        : null
    )
    setCompareSampleRowTarget(null)
    setNavigationTrail((current) => current.slice(0, index + 1))
  }, [])

  const clearHoverCloseTimer = useCallback(() => {
    if (hoverCloseTimerRef.current) {
      window.clearTimeout(hoverCloseTimerRef.current)
      hoverCloseTimerRef.current = null
    }
  }, [])

  const clearDragState = useCallback(() => {
    setDragSourceTableKey('')
    setDropTargetTableKey('')
  }, [])

  const clearInboundUsageCloseTimer = useCallback(() => {
    if (inboundUsageCloseTimerRef.current) {
      window.clearTimeout(inboundUsageCloseTimerRef.current)
      inboundUsageCloseTimerRef.current = null
    }
  }, [])

  const clearFkHoverCloseTimer = useCallback(() => {
    if (fkHoverCloseTimerRef.current) {
      window.clearTimeout(fkHoverCloseTimerRef.current)
      fkHoverCloseTimerRef.current = null
    }
  }, [])

  const openHoverTable = useCallback(
    (event, schemaName, tableName) => {
      clearHoverCloseTimer()
      setHoverTableKey(`${schemaName}.${tableName}`)
      setHoverAnchorEl(event.currentTarget)
    },
    [clearHoverCloseTimer]
  )

  const closeHoverTable = useCallback(() => {
    clearHoverCloseTimer()
    hoverCloseTimerRef.current = window.setTimeout(() => {
      setHoverAnchorEl(null)
      setHoverTableKey('')
      hoverCloseTimerRef.current = null
    }, 120)
  }, [clearHoverCloseTimer])

  const cancelHoverClose = useCallback(() => {
    clearHoverCloseTimer()
  }, [clearHoverCloseTimer])

  const handleTableDragStart = useCallback((event, schemaName, tableName) => {
    const tableKey = createTableKey(schemaName, tableName)
    clearHoverCloseTimer()
    setHoverAnchorEl(null)
    setHoverTableKey('')
    setFkHoverPreview(null)
    setInboundUsagePreview(null)
    setDragSourceTableKey(tableKey)
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/json', JSON.stringify({ schemaName, tableName }))
  }, [clearHoverCloseTimer])

  const handleTableDragEnd = useCallback(() => {
    clearDragState()
  }, [clearDragState])

  const handleTableDrop = useCallback(
    (event, targetSchemaName, targetTableName) => {
      event.preventDefault()

      let payload = null
      try {
        payload = JSON.parse(event.dataTransfer.getData('application/json'))
      } catch (parseError) {
        payload = null
      }

      const sourceSchemaName = payload?.schemaName
      const sourceTableName = payload?.tableName

      if (!sourceSchemaName || !sourceTableName) {
        clearDragState()
        return
      }

      if (sourceSchemaName === targetSchemaName && sourceTableName === targetTableName) {
        clearDragState()
        return
      }

      setSchemas((currentSchemas) =>
        addForeignKeyLinkToSchemas(
          currentSchemas,
          sourceSchemaName,
          sourceTableName,
          targetSchemaName,
          targetTableName
        )
      )

      setActiveTableKey(createTableKey(sourceSchemaName, sourceTableName))
      setSelectedSampleRowTarget(null)
      setCompareSampleRowTarget(null)
      setNavigationTrail([{ schemaName: sourceSchemaName, tableName: sourceTableName, keyValue: null }])
      clearDragState()
    },
    [clearDragState]
  )

  const handleTableDragOver = useCallback((event, schemaName, tableName) => {
    if (!dragSourceTableKey) {
      return
    }

    event.preventDefault()
    setDropTargetTableKey(createTableKey(schemaName, tableName))
    event.dataTransfer.dropEffect = 'copy'
  }, [dragSourceTableKey])

  const openInboundUsagePreview = useCallback(
    (event, schemaName, tableName) => {
      clearInboundUsageCloseTimer()
      const summary = getInboundUsageSummary(schemas, schemaName, tableName)

      setInboundUsagePreview({
        ...summary,
        anchorEl: createVirtualAnchor(event.currentTarget),
      })
    },
    [clearInboundUsageCloseTimer, schemas]
  )

  const removeInboundUsageSource = useCallback((sourceSchemaName, sourceTableName, sourceColumnName) => {
    setSchemas((currentSchemas) => {
      const nextSchemas = removeForeignKeyUsageFromSchemas(
        currentSchemas,
        sourceSchemaName,
        sourceTableName,
        sourceColumnName
      )

      setInboundUsagePreview((currentPreview) => {
        if (!currentPreview) {
          return currentPreview
        }

        return {
          ...getInboundUsageSummary(
            nextSchemas,
            currentPreview.schemaName,
            currentPreview.tableName
          ),
          anchorEl: currentPreview.anchorEl,
        }
      })

      return nextSchemas
    })
  }, [])

  const closeInboundUsagePreview = useCallback(() => {
    clearInboundUsageCloseTimer()
    inboundUsageCloseTimerRef.current = window.setTimeout(() => {
      setInboundUsagePreview(null)
      inboundUsageCloseTimerRef.current = null
    }, 120)
  }, [clearInboundUsageCloseTimer])

  const cancelInboundUsageClose = useCallback(() => {
    clearInboundUsageCloseTimer()
  }, [clearInboundUsageCloseTimer])

  const openFkHoverPreview = useCallback(
    (event, schemaName, references, value) => {
      clearFkHoverCloseTimer()
      const preview =
        getReferencedRowPreview(schemas, schemaName, references, value) ?? {
          schemaName,
          tableName: getReferencedTableName(references),
          primaryKey: 'id',
          row: null,
          columns: [],
        }

      setFkHoverPreview({
        ...preview,
        anchorEl: createVirtualAnchor(event.currentTarget),
      })
    },
    [clearFkHoverCloseTimer, schemas]
  )

  const closeFkHoverPreview = useCallback(() => {
    clearFkHoverCloseTimer()
    fkHoverCloseTimerRef.current = window.setTimeout(() => {
      setFkHoverPreview(null)
      fkHoverCloseTimerRef.current = null
    }, 120)
  }, [clearFkHoverCloseTimer])

  const cancelFkHoverClose = useCallback(() => {
    clearFkHoverCloseTimer()
  }, [clearFkHoverCloseTimer])

  const navigateToForeignTable = useCallback(
    (schemaName, references, selectedValue) => {
      const resolvedTable = resolveReferencedTableLocation(schemas, schemaName, references)
      if (!resolvedTable) {
        return
      }

      setActiveTableKey(`${resolvedTable.schemaName}.${resolvedTable.table.tableName}`)
      setCompareSampleRowTarget(null)
      if (selectedValue !== undefined) {
        setSelectedSampleRowTarget({
          schemaName: resolvedTable.schemaName,
          tableName: resolvedTable.table.tableName,
          keyValue: selectedValue,
        })
      }
      setNavigationTrail((current) => [
        ...current,
        {
          schemaName: resolvedTable.schemaName,
          tableName: resolvedTable.table.tableName,
          keyValue: selectedValue ?? null,
        },
      ])
    },
    [schemas]
  )

  const navigateToTable = useCallback((schemaName, tableName) => {
    setActiveTableKey(createTableKey(schemaName, tableName))
    setSelectedSampleRowTarget(null)
    setCompareSampleRowTarget(null)
    setNavigationTrail([{ schemaName, tableName, keyValue: null }])
  }, [])

  const hoverTable = useMemo(() => {
    if (!hoverTableKey) {
      return null
    }

    const [schemaName, tableName] = hoverTableKey.split('.')
    const schema = schemas.find((item) => item.schemaName === schemaName)
    const table = schema?.tables?.find((item) => item.tableName === tableName)

    return schema && table ? { schemaName, tableName, table } : null
  }, [hoverTableKey, schemas])

  const getColumnPalette = useCallback(
    (role) => {
      const headerText =
        theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white

      if (role === 'pk') {
        return {
          bg: alpha(theme.palette.warning.main, 0.015),
          border: theme.palette.warning.main,
          headerBg: theme.palette.warning.main,
          headerText,
          dataText: theme.palette.text.primary,
        }
      }

      if (role === 'fk') {
        return {
          bg: alpha(theme.palette.info.main, 0.015),
          border: theme.palette.info.main,
          headerBg: theme.palette.info.main,
          headerText,
          dataText: theme.palette.text.primary,
        }
      }

      return {
        bg: alpha(theme.palette.primary.main, 0.009),
        border: theme.palette.primary.main,
        headerBg: theme.palette.primary.main,
        headerText,
        dataText: theme.palette.text.primary,
      }
    },
    [theme]
  )

  const loadTables = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      if (tablesMode !== 'api') {
        setSchemas(normalizeTableInventory(mockTableResponse))
        setModeLabel('mock')
        return
      }

      if (!auth0Audience) {
        throw new Error('VITE_AUTH0_AUDIENCE is required when tables mode is api.')
      }

      const headers = {}
      const accessToken = await getAccessTokenSilently({
        authorizationParams: { audience: auth0Audience },
      })
      headers.Authorization = `Bearer ${accessToken}`

      const response = await httpClient.get(tablesEndpoint, { headers })
      setSchemas(normalizeTableInventory(response.data))
      setModeLabel('api')
    } catch (fetchError) {
      console.error('Error loading schema tables:', fetchError)

      const status = fetchError?.response?.status
      if (tablesMode === 'api') {
        if (status === 401 || status === 403) {
          setError(
            'The API rejected the request. Check VITE_AUTH0_AUDIENCE and backend authorization.'
          )
        } else if (status) {
          setError(`The API returned HTTP ${status}.`)
        } else {
          setError('Unable to load the table list right now.')
        }
      } else {
        setSchemas(normalizeTableInventory(mockTableResponse))
        setModeLabel('mock')
      }
    } finally {
      setIsLoading(false)
    }
  }, [getAccessTokenSilently])

  useEffect(() => {
    if (user) {
      loadTables()
    }
  }, [loadTables, user])

  useEffect(() => {
    setCompareSampleRowTarget(null)
  }, [activeTableKey])

  useEffect(() => () => clearHoverCloseTimer(), [clearHoverCloseTimer])
  useEffect(() => () => clearInboundUsageCloseTimer(), [clearInboundUsageCloseTimer])
  useEffect(() => () => clearFkHoverCloseTimer(), [clearFkHoverCloseTimer])

  const totalTables = useMemo(
    () => schemas.reduce((count, schema) => count + schema.tables.length, 0),
    [schemas]
  )

  const activeTable = useMemo(() => {
    if (!activeTableKey) {
      return null
    }

    const [schemaName, tableName] = activeTableKey.split('.')
    const schema = schemas.find((item) => item.schemaName === schemaName)
    if (!schema) {
      return null
    }

    const table = schema.tables.find((item) => item.tableName === tableName)
    if (!table) {
      return null
    }

    const primaryKey = table.primaryKey ?? []
    const foreignKeys = table.foreignKeys ?? []

    return {
      schemaName,
      tableName,
      columns: table.columns,
      primaryKey,
      foreignKeys,
      sampleRows: table.sampleRows ?? [],
    }
  }, [activeTableKey, schemas])

  const selectedRowResolution = useMemo(
    () => resolveRowTarget(activeTable, selectedSampleRowTarget),
    [activeTable, selectedSampleRowTarget]
  )

  const compareRowResolution = useMemo(
    () => resolveRowTarget(activeTable, compareSampleRowTarget),
    [activeTable, compareSampleRowTarget]
  )

  const selectedSampleRowIndex = selectedRowResolution.index
  const selectedSampleRow = selectedRowResolution.row
  const compareSampleRowIndex = compareRowResolution.index
  const compareSampleRow = compareRowResolution.row

  const visibleSchemas = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return schemas
    }

    return schemas
      .map((schema) => {
        const schemaMatches = schema.schemaName.toLowerCase().includes(query)
        const tables = schemaMatches
          ? schema.tables
          : schema.tables.filter((table) => tableMatchesSearch(schema.schemaName, table, query))

        return {
          ...schema,
          tables,
        }
      })
      .filter((schema) => schema.tables.length > 0)
  }, [schemas, searchQuery])

  const visibleTableCount = useMemo(
    () => visibleSchemas.reduce((count, schema) => count + schema.tables.length, 0),
    [visibleSchemas]
  )

  const tableRelationshipMap = useMemo(() => {
    const map = new Map()

    schemas.forEach((schema) => {
      schema.tables.forEach((table) => {
        map.set(createTableKey(schema.schemaName, table.tableName), {
          schemaName: schema.schemaName,
          tableName: table.tableName,
          pkCount: table.primaryKey?.length ?? 0,
          fkCount: table.foreignKeys?.length ?? 0,
          inboundCount: 0,
          inboundSources: [],
        })
      })
    })

    schemas.forEach((schema) => {
      schema.tables.forEach((table) => {
        ;(table.foreignKeys ?? []).forEach((foreignKey) => {
          const resolvedTable = resolveReferencedTableLocation(
            schemas,
            schema.schemaName,
            foreignKey.references
          )

          if (!resolvedTable) {
            return
          }

          const summary = map.get(createTableKey(resolvedTable.schemaName, resolvedTable.table.tableName))
          if (summary) {
            summary.inboundCount += 1
            summary.inboundSources.push({
              schemaName: schema.schemaName,
              tableName: table.tableName,
              columnName: foreignKey.column,
            })
          }
        })
      })
    })

    return map
  }, [schemas])

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h4" component="h1">
              List tables
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Protected page for signed-in users. It shows schema/table names only and can run on
              mock data until the Java API is ready.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            <Chip label={`Schemas: ${schemas.length}`} color="primary" variant="outlined" />
            <Chip label={`Tables: ${totalTables}`} color="secondary" variant="outlined" />
            <Chip
              label={modeLabel === 'api' ? 'Live API mode' : 'Mock data mode'}
              color={modeLabel === 'api' ? 'success' : 'warning'}
              variant="outlined"
            />
            {modeLabel === 'api' ? (
              <Chip
                label={auth0Audience ? 'Auth0 API token enabled' : 'No API audience configured'}
                color={auth0Audience ? 'success' : 'warning'}
                variant="outlined"
              />
            ) : null}
            <Button variant="contained" onClick={loadTables} disabled={isLoading}>
              Refresh
            </Button>
          </Stack>
        </Stack>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2} alignItems="center">
            <Avatar
              src={user?.picture}
              alt={user?.name}
              sx={{ width: 100, height: 100 }}
            />
            <Stack spacing={0.5} alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadTables}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : null}

        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 6,
            }}
          >
            <CircularProgress />
          </Box>
        ) : schemas.length > 0 ? (
          <Stack spacing={2}>
            <SectionCard title="How to use this page">
              <Stack spacing={1.5}>
                <Typography variant="body2" color="text.secondary">
                  Click a table chip to open it. Hover a table chip to preview columns, and use the
                  PK / FK / IN badges to understand table roles quickly.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click any FK cell to jump to the master table and auto-select the matching row.
                  Shift-click a row to set it as the compare row and show the row diff.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hover or click the IN badge to see inbound table chips. Remove a chip to drop that
                  FK link from the page state.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use the search box to filter by schema, table, column, FK reference, or sample
                  value. Breadcrumb chips show the path you followed and can be clicked to go back.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drag one table chip onto another to create a new FK link from the source table to
                  the target table. Starting a drag closes the hover popups first.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label="Enter / Space: open table or follow FK" size="small" variant="outlined" />
                  <Chip label="Arrow keys: move between chips or rows" size="small" variant="outlined" />
                  <Chip label="Esc: close FK preview" size="small" variant="outlined" />
                  <Chip label="Shift-click: compare rows" size="small" variant="outlined" />
                  <Chip label="Delete inbound chip: remove FK link" size="small" variant="outlined" />
                </Stack>
              </Stack>
            </SectionCard>

            <Paper sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Search tables, columns, FK values"
                    placeholder="customers, category_id, 101, orders..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => setSearchQuery('')}
                    disabled={!searchQuery}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Clear
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`Schemas: ${visibleSchemas.length}`} color="primary" variant="outlined" />
                  <Chip label={`Visible tables: ${visibleTableCount}`} color="secondary" variant="outlined" />
                  {searchQuery ? (
                    <Chip label={`Filter: ${searchQuery}`} color="info" variant="outlined" />
                  ) : null}
                </Stack>
              </Stack>
            </Paper>

            {visibleSchemas.length > 0 ? (
              visibleSchemas.map((schema) => (
                <SectionCard
                  key={schema.schemaName}
                  title={`${schema.schemaName} (${schema.tables.length})`}
                >
                  <Stack spacing={2}>
                    {navigationTrail.length > 0 ? (
                      <Stack spacing={0.75}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          Breadcrumbs
                        </Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                          {navigationTrail.map((entry, index) => {
                            const isCurrent = index === navigationTrail.length - 1

                            return (
                              <Chip
                                key={`${entry.schemaName}-${entry.tableName}-${index}`}
                                label={
                                  entry.keyValue !== null && entry.keyValue !== undefined
                                    ? `${entry.tableName} #${entry.keyValue}`
                                    : entry.tableName
                                }
                                color={isCurrent ? 'primary' : 'default'}
                                variant={isCurrent ? 'filled' : 'outlined'}
                                size="small"
                                clickable
                                onClick={() =>
                                  navigateBreadcrumb(
                                    index,
                                    entry.schemaName,
                                    entry.tableName,
                                    entry.keyValue
                                  )
                                }
                              />
                            )
                          })}
                        </Stack>
                      </Stack>
                    ) : null}

                    {schema.tables.length > 0 ? (
                      <>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {schema.tables.map((table, index) => {
                            const tableSummary =
                              tableRelationshipMap.get(`${schema.schemaName}.${table.tableName}`) ?? {
                                pkCount: table.primaryKey?.length ?? 0,
                                fkCount: table.foreignKeys?.length ?? 0,
                                inboundCount: 0,
                              }

                            return (
                              <Box
                                key={`${schema.schemaName}-${table.tableName}`}
                                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                              >
                                <Chip
                                  label={table.tableName}
                                  color="primary"
                                  variant={
                                    isTableExpanded(schema.schemaName, table.tableName)
                                      ? 'filled'
                                      : 'outlined'
                                  }
                                  onClick={() => toggleTable(schema.schemaName, table.tableName)}
                                  clickable
                                  draggable
                                  tabIndex={0}
                                  data-table-chip-group={schema.schemaName}
                                  data-table-chip-order={index}
                                  title="Drag to another table chip to create an FK"
                                  onMouseEnter={(event) =>
                                    openHoverTable(event, schema.schemaName, table.tableName)
                                  }
                                  onMouseLeave={closeHoverTable}
                                  onFocus={(event) =>
                                    openHoverTable(event, schema.schemaName, table.tableName)
                                  }
                                  onBlur={closeHoverTable}
                                  onDragStart={(event) =>
                                    handleTableDragStart(event, schema.schemaName, table.tableName)
                                  }
                                  onDragEnd={handleTableDragEnd}
                                  onDragOver={(event) =>
                                    handleTableDragOver(event, schema.schemaName, table.tableName)
                                  }
                                  onDragLeave={() => {
                                    if (dropTargetTableKey === createTableKey(schema.schemaName, table.tableName)) {
                                      setDropTargetTableKey('')
                                    }
                                  }}
                                  onDrop={(event) =>
                                    handleTableDrop(event, schema.schemaName, table.tableName)
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault()
                                      toggleTable(schema.schemaName, table.tableName)
                                      return
                                    }

                                    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
                                      return
                                    }

                                    event.preventDefault()
                                    const chips = Array.from(
                                      event.currentTarget.parentElement?.parentElement?.querySelectorAll(
                                        `[data-table-chip-group="${schema.schemaName}"]`
                                      ) ?? []
                                    )
                                    const currentIndex = Number(
                                      event.currentTarget.dataset.tableChipOrder ?? '0'
                                    )
                                    const nextIndex =
                                      event.key === 'ArrowRight' ? currentIndex + 1 : currentIndex - 1
                                    const nextChip = chips[nextIndex]
                                    nextChip?.focus()
                                  }}
                                  sx={{
                                    borderStyle: dragSourceTableKey === createTableKey(schema.schemaName, table.tableName)
                                      ? 'dashed'
                                      : 'solid',
                                    borderWidth:
                                      dragSourceTableKey === createTableKey(schema.schemaName, table.tableName)
                                        ? 2
                                        : 1,
                                    outline:
                                      dropTargetTableKey === createTableKey(schema.schemaName, table.tableName)
                                        ? `2px solid ${theme.palette.secondary.main}`
                                        : 'none',
                                    outlineOffset: 2,
                                  }}
                                />
                                <Chip
                                  label={`PK ${tableSummary.pkCount}`}
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                />
                                <Chip
                                  label={`FK ${tableSummary.fkCount}`}
                                  size="small"
                                  variant="outlined"
                                  color="info"
                                />
                                <Chip
                                  label={`IN ${tableSummary.inboundCount}`}
                                  size="small"
                                  variant={tableSummary.inboundCount > 0 ? 'filled' : 'outlined'}
                                  color="secondary"
                                  clickable={tableSummary.inboundCount > 0}
                                  onMouseEnter={(event) =>
                                    tableSummary.inboundCount > 0
                                      ? openInboundUsagePreview(
                                          event,
                                          schema.schemaName,
                                          table.tableName
                                        )
                                      : undefined
                                  }
                                  onMouseLeave={
                                    tableSummary.inboundCount > 0 ? closeInboundUsagePreview : undefined
                                  }
                                  onFocus={(event) =>
                                    tableSummary.inboundCount > 0
                                      ? openInboundUsagePreview(
                                          event,
                                          schema.schemaName,
                                          table.tableName
                                        )
                                      : undefined
                                  }
                                  onBlur={
                                    tableSummary.inboundCount > 0 ? closeInboundUsagePreview : undefined
                                  }
                                  onClick={
                                    tableSummary.inboundCount > 0
                                      ? (event) => {
                                          event.stopPropagation()
                                          openInboundUsagePreview(
                                            event,
                                            schema.schemaName,
                                            table.tableName
                                          )
                                        }
                                      : undefined
                                  }
                                />
                              </Box>
                            )
                          })}
                        </Stack>

                        <Popper
                        open={Boolean(hoverAnchorEl) && Boolean(hoverTable)}
                        anchorEl={hoverAnchorEl}
                        placement="top-start"
                        disablePortal
                        modifiers={[
                          { name: 'offset', options: { offset: [0, 8] } },
                          { name: 'preventOverflow', options: { padding: 8 } },
                        ]}
                        style={{ zIndex: 1300 }}
                        onMouseEnter={cancelHoverClose}
                        onMouseLeave={closeHoverTable}
                      >
                        <Paper
                          elevation={6}
                          sx={{ p: 1.5, maxWidth: 360 }}
                          onMouseEnter={cancelHoverClose}
                          onMouseLeave={closeHoverTable}
                        >
                          {hoverTable ? (
                            <Stack spacing={0.75}>
                              <Typography variant="caption" fontWeight={700}>
                                {hoverTable.table.tableName} columns
                              </Typography>
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {hoverTable.table.columns.length > 0 ? (
                                  hoverTable.table.columns.map((columnName) => {
                                    const isPk = hoverTable.table.primaryKey?.includes(columnName)
                                    const fkTarget = hoverTable.table.foreignKeys?.find(
                                      (key) => key.column === columnName
                                    )

                                    return (
                                      <Chip
                                        key={`${hoverTable.schemaName}-${hoverTable.tableName}-${columnName}`}
                                        label={
                                          isPk
                                            ? `${columnName} (PK)`
                                            : fkTarget
                                              ? `${columnName} → ${getReferencedTableName(
                                                  fkTarget.references
                                                )}`
                                              : columnName
                                        }
                                        size="small"
                                        variant="filled"
                                        color={isPk ? 'warning' : fkTarget ? 'info' : 'primary'}
                                        clickable={Boolean(fkTarget)}
                                        onClick={
                                          fkTarget
                                            ? () =>
                                                navigateToForeignTable(
                                                  hoverTable.schemaName,
                                                  fkTarget.references
                                                )
                                            : undefined
                                        }
                                      />
                                    )
                                  })
                                ) : (
                                  <Typography variant="caption">No columns available.</Typography>
                                )}
                              </Stack>
                            </Stack>
                          ) : null}
                        </Paper>
                        </Popper>

                        <Popper
                        open={Boolean(fkHoverPreview)}
                        anchorEl={fkHoverPreview?.anchorEl ?? null}
                        placement="bottom-start"
                        disablePortal
                        modifiers={[
                          { name: 'offset', options: { offset: [0, 8] } },
                          { name: 'preventOverflow', options: { padding: 8 } },
                        ]}
                        style={{ zIndex: 1400 }}
                        onMouseEnter={cancelFkHoverClose}
                        onMouseLeave={closeFkHoverPreview}
                      >
                        <Paper
                          elevation={6}
                          sx={{
                            p: 1.5,
                            width: 'min(100vw - 32px, 960px)',
                            maxWidth: 'none',
                            borderRadius: 2,
                            border: '1px solid rgba(0, 0, 0, 0.9)',
                            backgroundImage:
                              theme.palette.mode === 'dark'
                                ? `linear-gradient(180deg, ${alpha(
                                    theme.palette.common.white,
                                    0.02
                                  )} 0%, ${theme.palette.background.paper} 100%)`
                                : 'none',
                            boxShadow:
                              theme.palette.mode === 'dark'
                                ? `
                                  inset 0 1px 0 ${alpha(theme.palette.common.white, 0.7)},
                                  inset 0 -1px 0 ${alpha(theme.palette.common.black, 0.08)},
                                  0 1px 0 ${alpha(theme.palette.common.black, 0.16)},
                                  0 16px 30px ${alpha(theme.palette.common.black, 0.18)}
                                `
                                : `0 8px 18px ${alpha(theme.palette.common.black, 0.1)}`,
                          }}
                          tabIndex={0}
                          onMouseEnter={cancelFkHoverClose}
                          onMouseLeave={closeFkHoverPreview}
                          onKeyDown={(event) => {
                            if (event.key === 'Escape') {
                              event.preventDefault()
                              closeFkHoverPreview()
                            }
                          }}
                        >
                          {fkHoverPreview ? (
                            <Stack spacing={1}>
                              <Typography variant="caption" fontWeight={700}>
                                {fkHoverPreview.tableName} master row
                              </Typography>
                              {fkHoverPreview.row ? (
                                <TableContainer
                                  component={Box}
                                  sx={{
                                    width: '100%',
                                    overflowX: 'hidden',
                                  }}
                                >
                                  <Table size="small" sx={{ width: '100%' }}>
                                    <TableHead>
                                      <TableRow>
                                        {fkHoverPreview.columns.map((columnName) => {
                                          const role = getColumnRole(fkHoverPreview, columnName)
                                          const palette = getColumnPalette(role)

                                          return (
                                            <TableCell
                                              key={`fk-head-${fkHoverPreview.tableName}-${columnName}`}
                                              sx={{
                                                bgcolor: palette.headerBg,
                                                fontWeight: 700,
                                                color: palette.headerText,
                                                borderColor: palette.border,
                                              }}
                                            >
                                              {columnName}
                                            </TableCell>
                                          )
                                        })}
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      <TableRow>
                                        {fkHoverPreview.columns.map((columnName) => {
                                          const role = getColumnRole(fkHoverPreview, columnName)
                                          const palette = getColumnPalette(role)

                                          return (
                                            <TableCell
                                              key={`fk-cell-${fkHoverPreview.tableName}-${columnName}`}
                                              sx={{
                                                bgcolor: palette.bg,
                                                color: palette.dataText,
                                                borderColor: palette.border,
                                              }}
                                            >
                                              {fkHoverPreview.row[columnName] ?? '-'}
                                            </TableCell>
                                          )
                                        })}
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No matching master row found.
                                </Typography>
                              )}
                            </Stack>
                          ) : null}
                        </Paper>
                        </Popper>

                        <Popper
                          open={Boolean(inboundUsagePreview)}
                          anchorEl={inboundUsagePreview?.anchorEl ?? null}
                          placement="bottom-start"
                          disablePortal
                          modifiers={[
                            { name: 'offset', options: { offset: [0, 8] } },
                            { name: 'preventOverflow', options: { padding: 8 } },
                          ]}
                          style={{ zIndex: 1350 }}
                          onMouseEnter={cancelInboundUsageClose}
                          onMouseLeave={closeInboundUsagePreview}
                        >
                          <Paper
                            elevation={6}
                            sx={{ p: 1.5, maxWidth: 420 }}
                            onMouseEnter={cancelInboundUsageClose}
                            onMouseLeave={closeInboundUsagePreview}
                          >
                            {inboundUsagePreview ? (
                              <Stack spacing={1}>
                                <Typography variant="caption" fontWeight={700}>
                                  Used by {inboundUsagePreview.inboundCount} table
                                  {inboundUsagePreview.inboundCount === 1 ? '' : 's'}
                                </Typography>
                                {inboundUsagePreview.inboundSources.length > 0 ? (
                                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                    {inboundUsagePreview.inboundSources.map((source) => (
                                      <Chip
                                        key={`${source.schemaName}-${source.tableName}-${source.columnName}`}
                                        label={`${source.tableName}.${source.columnName}`}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        clickable
                                        onClick={() =>
                                          navigateToTable(source.schemaName, source.tableName)
                                        }
                                        onDelete={() =>
                                          removeInboundUsageSource(
                                            source.schemaName,
                                            source.tableName,
                                            source.columnName
                                          )
                                        }
                                      />
                                    ))}
                                  </Stack>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No inbound references found.
                                  </Typography>
                                )}
                              </Stack>
                            ) : null}
                          </Paper>
                        </Popper>

                        <Collapse
                          in={Boolean(activeTable) && activeTable.schemaName === schema.schemaName}
                          timeout="auto"
                        unmountOnExit
                      >
                        {activeTable && activeTable.schemaName === schema.schemaName ? (
                          <Box sx={{ pt: 1 }}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Stack spacing={1}>
                                <Stack
                                  direction={{ xs: 'column', sm: 'row' }}
                                  spacing={1}
                                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                                  justifyContent="space-between"
                                >
                                  <Typography variant="subtitle2" fontWeight={700}>
                                    {activeTable.tableName}
                                  </Typography>
                                  <Chip
                                    label={`${(activeTable.columns ?? []).length} columns`}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                  />
                                </Stack>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                  Columns
                                </Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                                  {(activeTable.columns ?? []).length > 0 ? (
                                    activeTable.columns.map((columnName) => {
                                      const isPk = (activeTable.primaryKey ?? []).includes(columnName)
                                      const fkTarget = (activeTable.foreignKeys ?? []).find(
                                        (key) => key.column === columnName
                                      )

                                      return (
                                        <Chip
                                          key={`${activeTable.schemaName}-${activeTable.tableName}-${columnName}`}
                                          label={
                                            isPk
                                              ? `${columnName} (PK)`
                                              : fkTarget
                                                ? `${columnName} → ${getReferencedTableName(
                                                    fkTarget.references
                                                  )}`
                                                : columnName
                                          }
                                          color={
                                            isPk ? 'warning' : fkTarget ? 'info' : 'primary'
                                          }
                                          variant="filled"
                                          size="small"
                                          clickable={Boolean(fkTarget)}
                                          onClick={
                                            fkTarget
                                              ? () =>
                                                  navigateToForeignTable(
                                                    activeTable.schemaName,
                                                    fkTarget.references
                                                  )
                                              : undefined
                                          }
                                        />
                                      )
                                    })
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No columns available.
                                    </Typography>
                                  )}
                                </Stack>

                                <Box sx={{ pt: 1.5 }}>
                                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                    Sample data
                                  </Typography>
                                  <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                    sx={{
                                      mt: 0.75,
                                      maxHeight: 320,
                                      borderColor: alpha(theme.palette.primary.main, 0.12),
                                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                                    }}
                                  >
                                    <Table size="small" stickyHeader>
                                      <TableHead>
                                        <TableRow
                                          sx={{
                                            '& .MuiTableCell-root': {
                                              fontWeight: 700,
                                            },
                                          }}
                                        >
                                          {activeTable.columns.map((columnName) => {
                                            const role = getColumnRole(activeTable, columnName)
                                            const palette = getColumnPalette(role)

                                            return (
                                              <TableCell
                                                key={`${activeTable.tableName}-head-${columnName}`}
                                                sx={{
                                                  bgcolor: palette.headerBg,
                                                  color: palette.headerText,
                                                  borderColor: palette.border,
                                                }}
                                              >
                                                {columnName}
                                              </TableCell>
                                            )
                                          })}
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {(activeTable.sampleRows ?? []).length > 0 ? (
                                          activeTable.sampleRows.slice(0, 5).map((row, rowIndex) => {
                                            const isSelectedRow = selectedSampleRowIndex === rowIndex
                                            const isCompareRow = compareSampleRowIndex === rowIndex

                                            return (
                                              <TableRow
                                                key={`${activeTable.tableName}-row-${rowIndex}`}
                                                hover
                                                selected={isSelectedRow}
                                                tabIndex={0}
                                                data-row-table={activeTable.tableName}
                                                data-row-order={rowIndex}
                                                onClick={(event) => {
                                                  const rowKey = getRowIdentityValue(
                                                    activeTable,
                                                    row,
                                                    rowIndex
                                                  )
                                                  const rowTarget = {
                                                    schemaName: activeTable.schemaName,
                                                    tableName: activeTable.tableName,
                                                    keyValue: rowKey,
                                                  }

                                                  if (event.shiftKey || event.altKey) {
                                                    setCompareSampleRowTarget(rowTarget)
                                                    return
                                                  }

                                                  setSelectedSampleRowTarget(rowTarget)
                                                  updateTrailForTable(
                                                    activeTable.schemaName,
                                                    activeTable.tableName,
                                                    rowKey
                                                  )
                                                }}
                                                onKeyDown={(event) => {
                                                  if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault()
                                                    const rowKey = getRowIdentityValue(
                                                      activeTable,
                                                      row,
                                                      rowIndex
                                                    )
                                                    setSelectedSampleRowTarget({
                                                      schemaName: activeTable.schemaName,
                                                      tableName: activeTable.tableName,
                                                      keyValue: rowKey,
                                                    })
                                                    updateTrailForTable(
                                                      activeTable.schemaName,
                                                      activeTable.tableName,
                                                      rowKey
                                                    )
                                                    return
                                                  }

                                                  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
                                                    return
                                                  }

                                                  event.preventDefault()
                                                  const rows = Array.from(
                                                    event.currentTarget.parentElement?.querySelectorAll(
                                                      `[data-row-table="${activeTable.tableName}"]`
                                                    ) ?? []
                                                  )
                                                  const currentIndex = Number(
                                                    event.currentTarget.dataset.rowOrder ?? '0'
                                                  )
                                                  const nextIndex =
                                                    event.key === 'ArrowDown'
                                                      ? currentIndex + 1
                                                      : currentIndex - 1
                                                  rows[nextIndex]?.focus()
                                                }}
                                                sx={{
                                                  cursor: 'pointer',
                                                  '&:hover .MuiTableCell-root': {
                                                    filter: 'brightness(0.98)',
                                                  },
                                                  ...(isCompareRow && !isSelectedRow
                                                    ? {
                                                        bgcolor: alpha(
                                                          theme.palette.secondary.main,
                                                          theme.palette.mode === 'dark' ? 0.16 : 0.08
                                                        ),
                                                        '& .MuiTableCell-root': {
                                                          borderColor: theme.palette.secondary.main,
                                                        },
                                                      }
                                                    : {}),
                                                }}
                                              >
                                                {activeTable.columns.map((columnName) => {
                                                  const role = getColumnRole(activeTable, columnName)
                                                  const palette = getColumnPalette(role)
                                                  const fkTarget = activeTable.foreignKeys.find(
                                                    (key) => key.column === columnName
                                                  )
                                                  const cellBg = isSelectedRow
                                                    ? alpha(
                                                        theme.palette.primary.main,
                                                        theme.palette.mode === 'dark' ? 0.18 : 0.1
                                                      )
                                                    : isCompareRow
                                                      ? alpha(
                                                          theme.palette.secondary.main,
                                                          theme.palette.mode === 'dark' ? 0.14 : 0.075
                                                        )
                                                      : palette.bg
                                                  const cellBorder = isSelectedRow
                                                    ? theme.palette.primary.main
                                                    : isCompareRow
                                                      ? theme.palette.secondary.main
                                                      : palette.border
                                                  const cellWeight = isSelectedRow
                                                    ? 700
                                                    : isCompareRow
                                                      ? 600
                                                      : 400

                                                  return (
                                                    <TableCell
                                                      key={`${activeTable.tableName}-row-${rowIndex}-${columnName}`}
                                                      sx={{
                                                        bgcolor: cellBg,
                                                        color: palette.dataText,
                                                        borderColor: cellBorder,
                                                        fontWeight: cellWeight,
                                                        cursor: fkTarget ? 'pointer' : 'default',
                                                        ...(isSelectedRow
                                                          ? {
                                                              boxShadow: `inset 0 0 0 1px ${alpha(
                                                                theme.palette.primary.main,
                                                                0.28
                                                              )}`,
                                                            }
                                                          : {}),
                                                      }}
                                                      onMouseEnter={
                                                        fkTarget
                                                          ? (event) =>
                                                              openFkHoverPreview(
                                                                event,
                                                                activeTable.schemaName,
                                                                fkTarget.references,
                                                                row[columnName]
                                                              )
                                                          : undefined
                                                      }
                                                      onMouseLeave={
                                                        fkTarget ? closeFkHoverPreview : undefined
                                                      }
                                                      onClick={
                                                        fkTarget
                                                          ? (event) => {
                                                              event.stopPropagation()
                                                              navigateToForeignTable(
                                                                activeTable.schemaName,
                                                                fkTarget.references,
                                                                row[columnName]
                                                              )
                                                            }
                                                          : undefined
                                                      }
                                                      tabIndex={fkTarget ? 0 : -1}
                                                      onFocus={
                                                        fkTarget
                                                          ? (event) =>
                                                              openFkHoverPreview(
                                                                event,
                                                                activeTable.schemaName,
                                                                fkTarget.references,
                                                                row[columnName]
                                                              )
                                                          : undefined
                                                      }
                                                      onBlur={fkTarget ? closeFkHoverPreview : undefined}
                                                      onKeyDown={
                                                        fkTarget
                                                          ? (event) => {
                                                              if (
                                                                event.key === 'Enter' ||
                                                                event.key === ' '
                                                              ) {
                                                                event.preventDefault()
                                                                navigateToForeignTable(
                                                                  activeTable.schemaName,
                                                                  fkTarget.references,
                                                                  row[columnName]
                                                                )
                                                                return
                                                              }

                                                              if (event.key === 'Escape') {
                                                                event.preventDefault()
                                                                closeFkHoverPreview()
                                                              }
                                                            }
                                                          : undefined
                                                      }
                                                    >
                                                      {row[columnName] ?? '-'}
                                                    </TableCell>
                                                  )
                                                })}
                                              </TableRow>
                                            )
                                          })
                                        ) : (
                                            <TableRow>
                                            <TableCell
                                                colSpan={activeTable.columns.length}
                                                sx={{
                                                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                                                }}
                                              >
                                                <Typography variant="body2" color="text.secondary">
                                                  No sample rows available.
                                                </Typography>
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Box>

                                {selectedSampleRow && compareSampleRow ? (
                                  <Box sx={{ pt: 1.25 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                        Row diff
                                      </Typography>
                                      <Chip
                                        label="Selected vs Compare"
                                        size="small"
                                        color="secondary"
                                        variant="outlined"
                                      />
                                    </Stack>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ display: 'block', mt: 0.5 }}
                                    >
                                      Shift-click a row to set the comparison row.
                                    </Typography>
                                    <TableContainer
                                      component={Paper}
                                      variant="outlined"
                                      sx={{
                                        mt: 0.75,
                                        borderColor: alpha(theme.palette.secondary.main, 0.18),
                                        bgcolor: alpha(theme.palette.secondary.main, 0.02),
                                      }}
                                    >
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Column</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Selected</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Compare</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {activeTable.columns.map((columnName) => {
                                            const selectedValue = selectedSampleRow[columnName] ?? '-'
                                            const compareValue = compareSampleRow[columnName] ?? '-'
                                            const changed =
                                              String(selectedValue) !== String(compareValue)

                                            return (
                                              <TableRow key={`diff-${activeTable.tableName}-${columnName}`}>
                                                <TableCell sx={{ fontWeight: 700 }}>{columnName}</TableCell>
                                                <TableCell
                                                  sx={{
                                                    bgcolor: changed
                                                      ? alpha(theme.palette.primary.main, 0.08)
                                                      : 'transparent',
                                                  }}
                                                >
                                                  {selectedValue}
                                                </TableCell>
                                                <TableCell
                                                  sx={{
                                                    bgcolor: changed
                                                      ? alpha(theme.palette.secondary.main, 0.08)
                                                      : 'transparent',
                                                  }}
                                                >
                                                  {compareValue}
                                                </TableCell>
                                              </TableRow>
                                            )
                                          })}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Box>
                                ) : null}
                              </Stack>
                            </Paper>
                          </Box>
                        ) : null}
                        </Collapse>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No tables returned for this schema.
                      </Typography>
                    )}

                    <Divider />
                    <Typography variant="body2" color="text.secondary">
                      Schema: {schema.schemaName}
                    </Typography>
                  </Stack>
                </SectionCard>
              ))
            ) : (
              <SectionCard title="No matches">
                <Typography variant="body2" color="text.secondary">
                  No schemas, tables, columns, or FK values matched the search.
                </Typography>
              </SectionCard>
            )}
          </Stack>
        ) : (
          <SectionCard title="No table data">
            <Typography variant="body2" color="text.secondary">
              The API returned no schema or table rows.
            </Typography>
          </SectionCard>
        )}
      </Stack>
    </PageContainer>
  )
}

export default DashboardPage
