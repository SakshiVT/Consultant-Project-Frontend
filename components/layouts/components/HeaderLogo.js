import styled from 'styled-components';

const HeaderLogo = () => {
  return (
    <Logo>DESO</Logo>
  )
}

const Logo = styled.h1`
  font-weight: bold;
  font-style: italic;
  font-size: 40px;
  margin-left: 11px;
  font-family: 'Praise';
  letter-spacing: 3px;
  cursor: pointer;
`

export default HeaderLogo