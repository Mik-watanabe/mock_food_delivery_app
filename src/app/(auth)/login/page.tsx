import { login } from './actions'
import { Button } from '@/components/ui/button'

const Login = () => {
  return (
    <Button onClick={login}>Login here</Button>
  )
}

export default Login