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
  if (!references) {
    return ''
  }

  return references.toString().split('.')[0].trim()
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
  const [activeTableKey, setActiveTableKey] = useState('')
  const [hoverTableKey, setHoverTableKey] = useState('')
  const [hoverAnchorEl, setHoverAnchorEl] = useState(null)
  const hoverCloseTimerRef = useRef(null)

  const isTableExpanded = useCallback(
    (schemaName, tableName) => activeTableKey === `${schemaName}.${tableName}`,
    [activeTableKey]
  )

  const toggleTable = useCallback((schemaName, tableName) => {
    const tableKey = `${schemaName}.${tableName}`
    setActiveTableKey((current) => (current === tableKey ? '' : tableKey))
  }, [])

  const clearHoverCloseTimer = useCallback(() => {
    if (hoverCloseTimerRef.current) {
      window.clearTimeout(hoverCloseTimerRef.current)
      hoverCloseTimerRef.current = null
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

  const navigateToForeignTable = useCallback(
    (schemaName, references) => {
      const targetTable = getReferencedTableName(references)
      if (!targetTable) {
        return
      }

      setActiveTableKey(`${schemaName}.${targetTable}`)
    },
    []
  )

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
      if (role === 'pk') {
        return {
          bg: alpha(theme.palette.warning.main, 0.015),
          border: theme.palette.warning.main,
          headerBg: theme.palette.warning.main,
          headerText: theme.palette.common.white,
          dataText: theme.palette.text.primary,
        }
      }

      if (role === 'fk') {
        return {
          bg: alpha(theme.palette.info.main, 0.015),
          border: theme.palette.info.main,
          headerBg: theme.palette.info.main,
          headerText: theme.palette.common.white,
          dataText: theme.palette.text.primary,
        }
      }

      return {
        bg: alpha(theme.palette.primary.main, 0.009),
        border: theme.palette.primary.main,
        headerBg: theme.palette.primary.main,
        headerText: theme.palette.common.white,
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
  }, [auth0Audience, getAccessTokenSilently])

  useEffect(() => {
    if (user) {
      loadTables()
    }
  }, [loadTables, user])

  useEffect(() => () => clearHoverCloseTimer(), [clearHoverCloseTimer])

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
            {schemas.map((schema) => (
              <SectionCard
                key={schema.schemaName}
                title={`${schema.schemaName} (${schema.tables.length})`}
              >
                <Stack spacing={2}>
                  {schema.tables.length > 0 ? (
                    <>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {schema.tables.map((table) => (
                          <Chip
                            key={`${schema.schemaName}-${table.tableName}`}
                            label={table.tableName}
                            color="primary"
                            variant={
                              isTableExpanded(schema.schemaName, table.tableName)
                                ? 'filled'
                                : 'outlined'
                            }
                            onClick={() => toggleTable(schema.schemaName, table.tableName)}
                            clickable
                            onMouseEnter={(event) =>
                              openHoverTable(event, schema.schemaName, table.tableName)
                            }
                            onMouseLeave={closeHoverTable}
                          />
                        ))}
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
                                          activeTable.sampleRows.slice(0, 5).map((row, rowIndex) => (
                                            <TableRow
                                              key={`${activeTable.tableName}-row-${rowIndex}`}
                                              hover
                                              sx={{
                                                  '&:hover .MuiTableCell-root': {
                                                    filter: 'brightness(0.98)',
                                                },
                                                }}
                                              >
                                                {activeTable.columns.map((columnName) => {
                                                  const role = getColumnRole(activeTable, columnName)
                                                  const palette = getColumnPalette(role)

                                                  return (
                                                    <TableCell
                                                      key={`${activeTable.tableName}-row-${rowIndex}-${columnName}`}
                                                      sx={{
                                                        bgcolor: palette.bg,
                                                        color: palette.dataText,
                                                        borderColor: palette.border,
                                                      }}
                                                    >
                                                      {row[columnName] ?? '-'}
                                                    </TableCell>
                                                  )
                                                })}
                                              </TableRow>
                                            ))
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
            ))}
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
