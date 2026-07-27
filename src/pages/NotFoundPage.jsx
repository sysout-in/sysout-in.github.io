import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import PageContainer from '../components/common/PageContainer'

function NotFoundPage() {
  return (
    <PageContainer>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h4" component="h1">
          Page not found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The page you are trying to access does not exist.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Back to Home
        </Button>
      </Stack>
    </PageContainer>
  )
}

export default NotFoundPage
