import { ActionFunctionArgs, redirect } from "@remix-run/node"
import { login } from "./../util/Api"
import { Form } from "@remix-run/react"

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData()

  const username = body.get("username")
  const password = body.get("password")

  const loginResponse = await login(username as string, password as string)

  console.log(loginResponse)

  if (!loginResponse) {
    return redirect(`/login`)
  }

  return redirect(`/`)
}

export default function LoginRoute() {
  return (
    <Form method="post">
      <div className="flex flex-col items-center justify-center gap-5 mt-10">
        <img
          src="logo.svg"
          alt="logo"
          className="w-[200px] h-[200px] rounded-full"
        />
        <div className="text-3xl">
          <span>Welcome to </span>
          <span className="font-bold">Kaida</span>
        </div>
      </div>
      <div className="h-[100vh] w-full bg-transparent pointer-events-none top-10 right-0 absolute flex items-center justify-center">
        <div className="m-4 flex flex-col justify-between h-full w-full bg-transparent ">
          <div className="flex flex-col gap-4 justify-center items-center flex-grow bg-transparent ">
            <input
              className="textInput text-xl rounded p-2 w-full max-w-md pointer-events-auto"
              placeholder="Username"
              type="text"
              name="username"
            />
            <input
              className="textInput text-xl rounded p-2 w-full max-w-md pointer-events-auto"
              placeholder="Password"
              type="password"
              name="password"
            />
          </div>
        </div>
      </div>
      <div className="absolute h-[100vh] w-full top-0 left-0 bg-transparent pointer-events-none flex items-end justify-center">
        <button
          type="submit"
          className="w-full h-12 bg-blue-500 text-white pointer-events-auto"
        >
          Login
        </button>
      </div>
    </Form>
  )
}
