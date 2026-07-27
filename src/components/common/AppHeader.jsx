import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import MenuIcon from '@mui/icons-material/Menu'
import { useLocation, useNavigate } from 'react-router-dom'
import ThemeModeToggle from './ThemeModeToggle'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
]

function AppHeader({ mode, onToggleMode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const goTo = (path) => {
    navigate(path)
    setDrawerOpen(false)
  }

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: 64 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Sysout in
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {navItems.map((item) => (
              <Button
                key={item.path}
                color={location.pathname === item.path ? 'primary' : 'inherit'}
                variant={location.pathname === item.path ? 'contained' : 'text'}
                onClick={() => goTo(item.path)}
              >
                {item.label}
              </Button>
            ))}
            <ThemeModeToggle mode={mode} onToggle={onToggleMode} />
          </Stack>
        </Box>

        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          <ThemeModeToggle mode={mode} onToggle={onToggleMode} />
          <IconButton color="inherit" onClick={() => setDrawerOpen(true)} aria-label="open menu">
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, pt: 2 }} role="presentation">
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => goTo(item.path)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  )
}

export default AppHeader
