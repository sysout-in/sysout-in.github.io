import { useAuth0 } from '@auth0/auth0-react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import PageContainer from '../components/common/PageContainer'
import SectionCard from '../components/common/SectionCard'

function DashboardPage() {
  const { user } = useAuth0()

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Welcome, {user?.given_name || user?.name}! 👋
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2} alignItems="center">
            <Avatar
              src={user?.picture}
              alt={user?.name}
              sx={{ width: 100, height: 100 }}
            />
            <Stack spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        <SectionCard title="Account Information">
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Email
              </Typography>
              <Typography variant="body2">{user?.email}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Name
              </Typography>
              <Typography variant="body2">{user?.name}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Login Provider
              </Typography>
              <Chip label="Google" color="primary" variant="outlined" size="small" />
            </Box>
          </Stack>
        </SectionCard>

        <SectionCard title="Profile Details">
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              This is a protected page — only accessible after Google authentication via Auth0.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your profile information is securely managed by Auth0 and synced from your Google account.
            </Typography>
          </Stack>
        </SectionCard>
      </Stack>
    </PageContainer>
  )
}

export default DashboardPage
