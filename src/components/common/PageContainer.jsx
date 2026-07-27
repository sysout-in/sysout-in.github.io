import Container from '@mui/material/Container'

function PageContainer({ children }) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {children}
    </Container>
  )
}

export default PageContainer
