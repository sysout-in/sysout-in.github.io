import { useAuth0 } from '@auth0/auth0-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
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
        },
        {
          tableName: 'products',
          columns: ['id', 'name', 'sku', 'price', 'stock_quantity', 'category_id'],
        },
        {
          tableName: 'categories',
          columns: ['id', 'name', 'slug', 'parent_id'],
        },
        {
          tableName: 'carts',
          columns: ['id', 'customer_id', 'status', 'created_at', 'updated_at'],
        },
        {
          tableName: 'cart_items',
          columns: ['id', 'cart_id', 'product_id', 'quantity', 'unit_price'],
        },
        {
          tableName: 'orders',
          columns: ['id', 'customer_id', 'order_number', 'status', 'total_amount', 'created_at'],
        },
        {
          tableName: 'order_items',
          columns: ['id', 'order_id', 'product_id', 'quantity', 'unit_price', 'line_total'],
        },
        {
          tableName: 'payments',
          columns: ['id', 'order_id', 'payment_method', 'amount', 'status', 'paid_at'],
        },
        {
          tableName: 'shipments',
          columns: ['id', 'order_id', 'carrier', 'tracking_number', 'status', 'shipped_at'],
        },
        {
          tableName: 'discount_codes',
          columns: ['id', 'code', 'discount_type', 'discount_value', 'expires_at', 'active'],
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

function normalizeTableEntry(entry, fallbackIndex) {
  if (typeof entry === 'string' || typeof entry === 'number') {
    return {
      tableName: String(entry).trim(),
      columns: [],
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

  return {
    tableName: tableName || `table-${fallbackIndex + 1}`,
    columns,
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
  const { user, getAccessTokenSilently } = useAuth0()
  const [schemas, setSchemas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [modeLabel, setModeLabel] = useState('mock')
  const [activeTableKey, setActiveTableKey] = useState('')

  const isTableExpanded = useCallback(
    (schemaName, tableName) => activeTableKey === `${schemaName}.${tableName}`,
    [activeTableKey]
  )

  const toggleTable = useCallback((schemaName, tableName) => {
    const tableKey = `${schemaName}.${tableName}`
    setActiveTableKey((current) => (current === tableKey ? '' : tableKey))
  }, [])

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

    return { schemaName, tableName, columns: table.columns }
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
                          <Tooltip
                            key={`${schema.schemaName}-${table.tableName}`}
                            arrow
                            placement="top-start"
                            title={
                              table.columns.length > 0 ? (
                                <Stack spacing={0.5} sx={{ maxWidth: 320 }}>
                                  <Typography variant="caption" fontWeight={700}>
                                    Columns
                                  </Typography>
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                    {table.columns.map((columnName) => (
                                      <Chip
                                        key={`${schema.schemaName}-${table.tableName}-${columnName}`}
                                        label={columnName}
                                        size="small"
                                        variant="filled"
                                        color="primary"
                                      />
                                    ))}
                                  </Stack>
                                </Stack>
                              ) : (
                                <Typography variant="caption">No columns available.</Typography>
                              )
                            }
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
                            />
                          </Tooltip>
                        ))}
                      </Stack>

                      <Collapse
                        in={Boolean(activeTable) && activeTable.schemaName === schema.schemaName}
                        timeout="auto"
                        unmountOnExit
                      >
                        {activeTable && activeTable.schemaName === schema.schemaName ? (
                          <Box sx={{ pt: 1 }}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Stack spacing={1}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  {activeTable.tableName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                  Columns
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                  {activeTable.columns.length > 0 ? (
                                    activeTable.columns.map((columnName) => (
                                      <Chip
                                        key={`${activeTable.schemaName}-${activeTable.tableName}-${columnName}`}
                                        label={columnName}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                      />
                                    ))
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No columns available.
                                    </Typography>
                                  )}
                                </Stack>
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
