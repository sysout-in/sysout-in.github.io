import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined'
import HttpOutlinedIcon from '@mui/icons-material/HttpOutlined'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined'
import { Link as RouterLink } from 'react-router-dom'
import httpClient from '../api/httpClient'
import PageContainer from '../components/common/PageContainer'
import SectionCard from '../components/common/SectionCard'

function HomePage() {
  const [version, setVersion] = useState('loading...')

  useEffect(() => {
    httpClient
      .get(`version.json?v=${Date.now()}`)
      .then((response) => {
        setVersion(response.data?.version ?? 'dev')
      })
      .catch(() => {
        setVersion('dev')
      })
  }, [])

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Typography variant="h4" component="h1">
            App foundation is ready
          </Typography>
          <Chip label={`Version: ${version}`} color="primary" variant="outlined" />
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          <Box>
            <SectionCard title="Routing + Navigation">
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  React Router is wired with Home, About, Tables, and Not Found routes.
                </Typography>
                <Chip icon={<RouterOutlinedIcon />} label="react-router-dom" />
              </Stack>
            </SectionCard>
          </Box>
          <Box>
            <SectionCard title="HTTP Client">
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Axios client is configured and already used to fetch app version.
                </Typography>
                <Chip icon={<HttpOutlinedIcon />} label="axios" />
              </Stack>
            </SectionCard>
          </Box>
          <Box>
            <SectionCard title="MUI + Icons + Theme">
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Material UI, Material Icons, and light/dark theme toggle are enabled.
                </Typography>
                <Chip icon={<PaletteOutlinedIcon />} label="MUI + icons" />
              </Stack>
            </SectionCard>
          </Box>
          <Box>
            <SectionCard title="Common Components">
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Shared components added: AppHeader, PageContainer, and SectionCard.
                </Typography>
                <Chip icon={<WidgetsOutlinedIcon />} label="reusable components" />
              </Stack>
            </SectionCard>
          </Box>
        </Box>

        <Button component={RouterLink} to="/about" variant="contained" sx={{ alignSelf: 'start' }}>
          Go to About page
        </Button>
      </Stack>
    </PageContainer>
  )
}

export default HomePage
