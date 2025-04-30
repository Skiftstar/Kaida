import { usePage } from '~/contexts/PageContext'

export default function SessionsRoute() {
  const { setCurrPage } = usePage()
  setCurrPage('Sessions')

  return <div></div>
}
