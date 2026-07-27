import { createTheme } from '@mui/material/styles'

export const getAppTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#5e35b1' : '#b39ddb',
      },
      secondary: {
        main: mode === 'light' ? '#00897b' : '#80cbc4',
      },
      background: {
        default: mode === 'light' ? '#f8f9fb' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid',
          },
        },
      },
    },
  })
