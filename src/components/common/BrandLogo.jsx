import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router-dom'

const BrandLink = styled(RouterLink)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  textDecoration: 'none',
  color: 'inherit',
}))

const monospaceFontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'

const BrandText = styled(Typography)({
  fontFamily: monospaceFontFamily,
  fontWeight: 700,
  letterSpacing: '0.02em',
})

const BrandIcon = styled('img')({
  width: 18,
  height: 18,
  display: 'block',
})

function BrandLogo({ text, iconSrc, iconAlt = 'Brand icon' }) {
  return (
    <BrandLink to="/">
      {iconSrc ? <BrandIcon src={iconSrc} alt={iconAlt} /> : null}
      <BrandText variant="h6" component="span">
        {text}
      </BrandText>
    </BrandLink>
  )
}

export default BrandLogo
