import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import GoogleIcon from '@mui/icons-material/Google'
import LogoutIcon from '@mui/icons-material/Logout'

function AuthButton() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0()
  const [anchorEl, setAnchorEl] = useState(null)

  if (isLoading) {
    return <CircularProgress size={24} color="inherit" />
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant="outlined"
        size="small"
        startIcon={<GoogleIcon />}
        onClick={() => loginWithRedirect()}
      >
        Sign in
      </Button>
    )
  }

  return (
    <>
      <Tooltip title={user.name}>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
          <Avatar src={user.picture} alt={user.name} sx={{ width: 32, height: 32 }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          disableRipple
          sx={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'default' }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            {user.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            logout({ logoutParams: { returnTo: window.location.origin } })
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  )
}

export default AuthButton
