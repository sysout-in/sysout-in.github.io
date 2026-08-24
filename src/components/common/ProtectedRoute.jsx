import { useAuth0 } from '@auth0/auth0-react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          p: 2,
        }}
      >
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Typography variant="h5">Access Denied</Typography>
          <Typography variant="body2" color="text.secondary">
            You need to be logged in to access this page.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => loginWithRedirect()}>
              Sign in with Google
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </Stack>
        </Stack>
      </Box>
    )
  }

  return children
}

export default ProtectedRoute
