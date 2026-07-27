import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import PageContainer from '../components/common/PageContainer'
import SectionCard from '../components/common/SectionCard'

function AboutPage() {
  return (
    <PageContainer>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          About this setup
        </Typography>
        <SectionCard title="What is included">
          <List disablePadding>
            <ListItem disableGutters>
              <ListItemText primary="React Router for page navigation" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Axios for API calls" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Material UI components + Material Icons" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Responsive layout using MUI Grid and breakpoints" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Manual light/dark theme toggle" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Common reusable components for faster scaling" />
            </ListItem>
          </List>
        </SectionCard>
      </Stack>
    </PageContainer>
  )
}

export default AboutPage
